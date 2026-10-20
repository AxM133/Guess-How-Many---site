import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { query } from './db.js'
import { adminTelegramIds, sendMessage } from './telegram.js'

const TOKEN_TTL_MS = 12 * 3600_000
const MIN_PASSWORD_LENGTH = 12

// Защита от подбора: считаем неудачи в БД, поэтому лимит общий для всех экземпляров
// serverless-функции. 5 ошибок с одного IP или 30 ошибок суммарно за 15 минут — пауза.
const FAIL_WINDOW_MS = 15 * 60_000
const MAX_FAILS_PER_IP = 5
const MAX_FAILS_TOTAL = 30

const CODE_TTL_MS = 5 * 60_000
const MAX_CODE_ATTEMPTS = 5

const password = () => process.env.ADMIN_PASSWORD || ''
// Секрет выводится из пароля: смена пароля разлогинивает все сессии.
const secret = () => createHash('sha256').update(`guess-how-many:${password()}`).digest()
const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export const isPasswordStrong = () => password().length >= MIN_PASSWORD_LENGTH

export function checkPassword(input) {
  // Сравниваем хэши — время сравнения не зависит от длины введённого пароля
  const h = (s) => createHash('sha256').update(String(s)).digest()
  return isPasswordStrong() && timingSafeEqual(h(input), h(password()))
}

// ---------- Лимит неудачных попыток ----------

export class TooManyAttempts extends Error {}

export async function assertNotLocked(kind, ip) {
  const [{ by_ip, total }] = await query(
    `SELECT COUNT(*) FILTER (WHERE ip = $1)::int AS by_ip, COUNT(*)::int AS total
     FROM auth_failures WHERE kind = $2 AND at > $3`,
    [ip, kind, Date.now() - FAIL_WINDOW_MS],
  )
  if (by_ip >= MAX_FAILS_PER_IP || total >= MAX_FAILS_TOTAL) {
    throw new TooManyAttempts('Слишком много неудачных попыток. Вход временно заблокирован — попробуйте через 15 минут.')
  }
  return MAX_FAILS_PER_IP - by_ip
}

export async function recordFailure(kind, ip) {
  const now = Date.now()
  await query('DELETE FROM auth_failures WHERE at < $1', [now - 24 * 3600_000])
  await query('INSERT INTO auth_failures (ip, kind, at) VALUES ($1, $2, $3)', [ip, kind, now])
  await sleep(600) // замедляем перебор
}

// ---------- Вход в два шага: код в Telegram ----------

const hashCode = (id, code) => createHmac('sha256', secret()).update(`${id}:${code}`).digest('base64url')

export async function createChallenge() {
  const id = randomBytes(18).toString('base64url')
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const now = Date.now()
  await query('DELETE FROM admin_challenges WHERE created_at < $1', [now - 24 * 3600_000])
  await query('INSERT INTO admin_challenges (id, code_hash, created_at) VALUES ($1, $2, $3)', [id, hashCode(id, code), now])
  const text =
    `🔐 Код входа в админку «Угадай сумму»: <code>${code}</code>\n\n` +
    'Действует 5 минут. Если это не вы — срочно смените ADMIN_PASSWORD.'
  const results = await Promise.allSettled(adminTelegramIds().map((chatId) => sendMessage(chatId, text)))
  const delivered = results.filter((r) => r.status === 'fulfilled').length
  results.forEach((r) => r.status === 'rejected' && console.error(r.reason))
  return { id, delivered }
}

/** true — код верный; false — неверный; бросает ошибку, если вызов просрочен или исчерпан */
export async function verifyChallenge(id, code) {
  const [c] = await query('SELECT * FROM admin_challenges WHERE id = $1', [String(id)])
  if (!c || c.used || Date.now() - c.created_at > CODE_TTL_MS || c.attempts >= MAX_CODE_ATTEMPTS) {
    throw new TooManyAttempts('Код устарел. Введите пароль ещё раз, чтобы получить новый.')
  }
  if (safeEqual(hashCode(c.id, String(code).trim()), c.code_hash)) {
    const [row] = await query('UPDATE admin_challenges SET used = TRUE WHERE id = $1 AND used = FALSE RETURNING id', [c.id])
    return Boolean(row)
  }
  await query('UPDATE admin_challenges SET attempts = attempts + 1 WHERE id = $1', [c.id])
  return false
}

// ---------- Сессия ----------

export function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS)
  return `${exp}.${sign(exp)}`
}

export function requireAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer /, '')
  const [exp, sig] = token.split('.')
  if (isPasswordStrong() && exp && sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now()) return next()
  res.status(401).json({ error: 'Требуется вход' })
}

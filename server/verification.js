import { randomBytes } from 'node:crypto'
import { query } from './db.js'

// Подтверждение номера телефона через Telegram.
// token — секрет браузера (опрашивает статус и отправляет ответ),
// start_code — уходит в ссылку t.me/<бот>?start=<код>, по нему бот находит заявку.

export const PENDING_TTL = 15 * 60_000 // успеть поделиться номером в боте
export const VERIFIED_TTL = 60 * 60_000 // успеть отправить ответ после подтверждения
const KEEP_FOR = 7 * 24 * 3600_000

const randomId = (bytes) => randomBytes(bytes).toString('base64url')

export async function createVerification(ip) {
  const now = Date.now()
  const v = { token: randomId(24), start_code: randomId(12), created_at: now }
  await query('DELETE FROM verifications WHERE created_at < $1', [now - KEEP_FOR])
  await query('INSERT INTO verifications (token, start_code, ip, created_at) VALUES ($1, $2, $3, $4)', [
    v.token,
    v.start_code,
    ip,
    now,
  ])
  return v
}

export async function countRecentVerifications(ip, sinceMs) {
  const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM verifications WHERE ip = $1 AND created_at > $2', [ip, sinceMs])
  return n
}

export async function getVerification(token) {
  if (typeof token !== 'string' || token.length > 64) return null
  const [v] = await query('SELECT * FROM verifications WHERE token = $1', [token])
  return v ?? null
}

export function verificationStatus(v, now = Date.now()) {
  if (!v || v.used_at) return 'expired'
  if (v.verified_at) return now - v.verified_at < VERIFIED_TTL ? 'verified' : 'expired'
  return now - v.created_at < PENDING_TTL ? 'pending' : 'expired'
}

/** /start <код> в боте: привязываем заявку к Telegram-аккаунту */
export async function bindTelegram(startCode, user) {
  const [row] = await query(
    `UPDATE verifications SET tg_user_id = $2, tg_username = $3, tg_name = $4
     WHERE start_code = $1 AND verified_at IS NULL AND used_at IS NULL AND created_at > $5
     RETURNING token`,
    [startCode, String(user.id), user.username ?? null, user.first_name ?? null, Date.now() - PENDING_TTL],
  )
  return Boolean(row)
}

/** Пользователь поделился своим контактом: подтверждаем последнюю заявку этого аккаунта */
export async function confirmPhoneFromTelegram(tgUserId, phone) {
  const [row] = await query(
    `UPDATE verifications SET phone = $2, verified_at = $3
     WHERE token = (
       SELECT token FROM verifications
       WHERE tg_user_id = $1 AND verified_at IS NULL AND used_at IS NULL AND created_at > $4
       ORDER BY created_at DESC LIMIT 1
     )
     RETURNING token`,
    [String(tgUserId), phone, Date.now(), Date.now() - PENDING_TTL],
  )
  return Boolean(row)
}

/** Только для локальной разработки без бота */
export async function confirmPhoneDev(token, phone) {
  const [row] = await query(
    `UPDATE verifications SET phone = $2, verified_at = $3
     WHERE token = $1 AND verified_at IS NULL AND used_at IS NULL RETURNING token`,
    [token, phone, Date.now()],
  )
  return Boolean(row)
}

/** Атомарно «тратим» подтверждение: одним подтверждением — один ответ */
export async function claimVerification(token) {
  const [row] = await query('UPDATE verifications SET used_at = $2 WHERE token = $1 AND used_at IS NULL RETURNING token', [
    token,
    Date.now(),
  ])
  return Boolean(row)
}

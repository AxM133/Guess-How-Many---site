import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7
const password = () => process.env.ADMIN_PASSWORD || ''
// Секрет выводится из пароля: смена пароля разлогинивает все сессии.
const secret = () => createHash('sha256').update(`guess-how-many:${password()}`).digest()
const sign = (payload) => createHmac('sha256', secret()).update(payload).digest('base64url')

export function safeEqual(a, b) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export const checkPassword = (input) => Boolean(password()) && safeEqual(String(input), password())

export function issueToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS)
  return `${exp}.${sign(exp)}`
}

export function requireAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer /, '')
  const [exp, sig] = token.split('.')
  if (password() && exp && sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now()) return next()
  res.status(401).json({ error: 'Требуется вход' })
}

// Лимит попыток входа в памяти процесса. На Vercel он действует в пределах одного
// экземпляра функции — поэтому пароль должен быть длинным и случайным.
export function rateLimit({ windowMs, max }) {
  const hits = new Map()
  return (req, res, next) => {
    const now = Date.now()
    const list = (hits.get(req.ip) || []).filter((t) => now - t < windowMs)
    if (list.length >= max) return res.status(429).json({ error: 'Слишком много попыток. Попробуйте позже.' })
    list.push(now)
    hits.set(req.ip, list)
    next()
  }
}

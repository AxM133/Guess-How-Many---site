import { query } from './db.js'

// ---------- Доступ к данным ----------

export async function getContest() {
  const [c] = await query('SELECT * FROM contest WHERE id = 1')
  return c
}

export async function countGuesses(round) {
  const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM guesses WHERE round = $1', [round])
  return n
}

export const listGuesses = (round) =>
  query(
    'SELECT id, name, phone, amount, created_at, tg_username FROM guesses WHERE round = $1 ORDER BY created_at DESC',
    [round],
  )

export async function countRecentFromIp(ip, sinceMs) {
  const [{ n }] = await query('SELECT COUNT(*)::int AS n FROM guesses WHERE ip = $1 AND created_at > $2', [ip, sinceMs])
  return n
}

export const insertGuess = ({ round, name, phone, amount, ip, tgUserId, tgUsername }) =>
  query(
    `INSERT INTO guesses (round, name, phone, amount, created_at, ip, tg_user_id, tg_username)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [round, name, phone, amount, Date.now(), ip, tgUserId, tgUsername],
  )

export const removeGuess = (id, round) => query('DELETE FROM guesses WHERE id = $1 AND round = $2', [id, round])
export const setTimer = (startsAt, endsAt) =>
  query('UPDATE contest SET starts_at = $1, ends_at = $2, revealed = FALSE WHERE id = 1', [startsAt, endsAt])
export const setEnd = (endsAt) => query('UPDATE contest SET ends_at = $1 WHERE id = 1', [endsAt])
export const setAmount = (amount) =>
  query('UPDATE contest SET actual_amount = $1, revealed = CASE WHEN $1::int IS NULL THEN FALSE ELSE revealed END WHERE id = 1', [
    amount,
  ])
export const setRevealed = (revealed) => query('UPDATE contest SET revealed = $1 WHERE id = 1', [revealed])
export const newRound = () =>
  query(
    'UPDATE contest SET round = round + 1, starts_at = NULL, ends_at = NULL, actual_amount = NULL, revealed = FALSE WHERE id = 1',
  )

// ---------- Правила конкурса ----------

export function contestStatus(c, now = Date.now()) {
  if (!c.ends_at) return 'idle'
  return now < c.ends_at ? 'running' : 'finished'
}

// Ближе всех к реальной сумме; при равенстве побеждает тот, кто ответил раньше.
export function rankGuesses(guesses, actual) {
  return guesses
    .map((g) => ({ ...g, diff: Math.abs(g.amount - actual) }))
    .sort((a, b) => a.diff - b.diff || a.created_at - b.created_at)
}

export const maskPhone = (phone) => `+992 •• ••• •• ${phone.slice(-2)}`

export async function publicState() {
  const c = await getContest()
  const now = Date.now()
  const status = contestStatus(c, now)
  let result = null
  if (c.revealed && c.actual_amount != null && status === 'finished') {
    const ranked = rankGuesses(await listGuesses(c.round), c.actual_amount)
    result = {
      amount: c.actual_amount,
      winners: ranked.slice(0, 3).map((g) => ({ name: g.name, phone: maskPhone(g.phone), amount: g.amount, diff: g.diff })),
    }
  }
  return {
    status,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    now,
    participants: await countGuesses(c.round),
    result,
  }
}

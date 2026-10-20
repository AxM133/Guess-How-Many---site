import express from 'express'
import { checkPassword, issueToken, rateLimit, requireAdmin } from './auth.js'
import * as contest from './contest.js'

const GUESS_LIMIT = { windowMs: 10 * 60_000, max: 8 }

const app = express()
// На Vercel и за прокси реальный IP приходит в X-Forwarded-For
if (process.env.VERCEL || process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY || true)
app.use(express.json({ limit: '10kb' }))
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

// ---------- Публичное API ----------

app.get('/api/contest', async (req, res) => res.json(await contest.publicState()))

app.post('/api/guesses', async (req, res) => {
  const c = await contest.getContest()
  if (contest.contestStatus(c) !== 'running') return res.status(409).json({ error: 'Сейчас приём ответов закрыт' })

  if ((await contest.countRecentFromIp(req.ip, Date.now() - GUESS_LIMIT.windowMs)) >= GUESS_LIMIT.max)
    return res.status(429).json({ error: 'Слишком много ответов с этого устройства. Попробуйте позже.' })

  const name = String(req.body?.name ?? '').trim().replace(/\s+/g, ' ')
  const phone = String(req.body?.phone ?? '').replace(/\D/g, '')
  const amount = Number(req.body?.amount)

  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Укажите имя (2–60 символов)' })
  if (!/^992\d{9}$/.test(phone)) return res.status(400).json({ error: 'Укажите номер в формате +992 XX XXX XX XX' })
  if (!Number.isInteger(amount) || amount < 0 || amount > 10_000_000)
    return res.status(400).json({ error: 'Сумма должна быть целым числом от 0 до 10 000 000' })

  try {
    await contest.insertGuess({ round: c.round, name, phone, amount, ip: req.ip })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'С этого номера уже отправлен ответ' })
    throw err
  }
  res.status(201).json({ ok: true, participants: await contest.countGuesses(c.round) })
})

// ---------- Админка ----------

app.post('/api/admin/login', rateLimit({ windowMs: 15 * 60_000, max: 10 }), (req, res) => {
  if (!checkPassword(req.body?.password ?? '')) return res.status(401).json({ error: 'Неверный пароль' })
  res.json({ token: issueToken() })
})

app.use('/api/admin', requireAdmin)

app.get('/api/admin/state', async (req, res) => {
  const c = await contest.getContest()
  const guesses = await contest.listGuesses(c.round)
  res.json({
    ...(await contest.publicState()),
    round: c.round,
    actualAmount: c.actual_amount,
    revealed: c.revealed,
    guesses: c.actual_amount != null ? contest.rankGuesses(guesses, c.actual_amount) : guesses,
  })
})

app.post('/api/admin/contest/start', async (req, res) => {
  const now = Date.now()
  const endsAt = Number(req.body?.endsAt)
  if (!Number.isFinite(endsAt) || endsAt <= now + 60_000)
    return res.status(400).json({ error: 'Время окончания должно быть в будущем' })
  const c = await contest.getContest()
  // Если конкурс уже идёт — просто меняем время окончания.
  await contest.setTimer(contest.contestStatus(c, now) === 'running' ? c.starts_at : now, Math.round(endsAt))
  res.json({ ok: true })
})

app.post('/api/admin/contest/stop', async (req, res) => {
  if (contest.contestStatus(await contest.getContest()) === 'running') await contest.setEnd(Date.now())
  res.json({ ok: true })
})

app.post('/api/admin/contest/amount', async (req, res) => {
  const amount = req.body?.amount === null ? null : Number(req.body?.amount)
  if (amount !== null && (!Number.isInteger(amount) || amount < 0 || amount > 1_000_000_000))
    return res.status(400).json({ error: 'Некорректная сумма' })
  await contest.setAmount(amount)
  res.json({ ok: true })
})

app.post('/api/admin/contest/reveal', async (req, res) => {
  const c = await contest.getContest()
  const reveal = Boolean(req.body?.revealed)
  if (reveal && contest.contestStatus(c) !== 'finished') return res.status(409).json({ error: 'Сначала завершите конкурс' })
  if (reveal && c.actual_amount == null) return res.status(409).json({ error: 'Сначала укажите реальную сумму' })
  await contest.setRevealed(reveal)
  res.json({ ok: true })
})

app.post('/api/admin/contest/reset', async (req, res) => {
  await contest.newRound()
  res.json({ ok: true })
})

app.delete('/api/admin/guesses/:id', async (req, res) => {
  const c = await contest.getContest()
  await contest.removeGuess(Number(req.params.id), c.round)
  res.json({ ok: true })
})

app.get('/api/admin/export.csv', async (req, res) => {
  const c = await contest.getContest()
  let rows = await contest.listGuesses(c.round)
  if (c.actual_amount != null) rows = contest.rankGuesses(rows, c.actual_amount)
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['Имя', 'Телефон', 'Ответ (сомони)', 'Разница', 'Время']
  const lines = rows.map((g) =>
    [g.name, `+${g.phone}`, g.amount, g.diff ?? '', new Date(g.created_at).toISOString()].map(esc).join(','),
  )
  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', `attachment; filename="guesses-round-${c.round}.csv"`)
  res.send('﻿' + [header.map(esc).join(','), ...lines].join('\n'))
})

app.use('/api', (req, res) => res.status(404).json({ error: 'Не найдено' }))

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Ошибка сервера' })
})

if (!process.env.ADMIN_PASSWORD) console.warn('⚠️  ADMIN_PASSWORD не задан — вход в админку отключён')

export default app

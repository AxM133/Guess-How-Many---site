import express from 'express'
import {
  assertNotLocked,
  checkPassword,
  createChallenge,
  isPasswordStrong,
  issueToken,
  recordFailure,
  requireAdmin,
  TooManyAttempts,
  verifyChallenge,
} from './auth.js'
import { handleUpdate } from './bot.js'
import * as contest from './contest.js'
import { callTelegram, getBot, telegramEnabled, twoFactorEnabled, webhookSecret } from './telegram.js'
import * as verification from './verification.js'

const GUESS_LIMIT = { windowMs: 10 * 60_000, max: 8 }
const VERIFY_LIMIT = { windowMs: 10 * 60_000, max: 10 }
// Локально без бота номер подтверждается кнопкой-заглушкой (на Vercel это запрещено)
const devVerification = () => !process.env.VERCEL && !telegramEnabled()

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

// ---------- Подтверждение номера ----------

app.post('/api/verify/start', async (req, res) => {
  const recent = await verification.countRecentVerifications(req.ip, Date.now() - VERIFY_LIMIT.windowMs)
  if (recent >= VERIFY_LIMIT.max) return res.status(429).json({ error: 'Слишком много попыток. Подождите несколько минут.' })
  if (!telegramEnabled() && !devVerification())
    return res.status(503).json({ error: 'Подтверждение номера временно недоступно' })

  const v = await verification.createVerification(req.ip)
  const expiresAt = v.created_at + verification.PENDING_TTL
  if (devVerification()) return res.json({ token: v.token, dev: true, expiresAt })
  const { username } = await getBot()
  res.json({ token: v.token, botUrl: `https://t.me/${username}?start=${v.start_code}`, expiresAt })
})

app.post('/api/verify/status', async (req, res) => {
  const v = await verification.getVerification(req.body?.token)
  const status = verification.verificationStatus(v)
  res.json(status === 'verified' ? { status, phone: v.phone, name: v.tg_name } : { status })
})

app.post('/api/verify/dev', async (req, res) => {
  if (!devVerification()) return res.status(404).json({ error: 'Не найдено' })
  const phone = String(req.body?.phone ?? '').replace(/\D/g, '')
  if (!/^992\d{9}$/.test(phone)) return res.status(400).json({ error: 'Номер в формате +992 XX XXX XX XX' })
  if (!(await verification.confirmPhoneDev(String(req.body?.token), phone)))
    return res.status(409).json({ error: 'Подтверждение устарело' })
  res.json({ ok: true })
})

app.post('/api/telegram/webhook', async (req, res) => {
  if (!telegramEnabled() || req.get('x-telegram-bot-api-secret-token') !== webhookSecret()) return res.sendStatus(401)
  try {
    await handleUpdate(req.body)
  } catch (err) {
    console.error('telegram update failed', err)
  }
  res.sendStatus(200) // иначе Telegram будет бесконечно повторять апдейт
})

// ---------- Ответы ----------

app.post('/api/guesses', async (req, res) => {
  const c = await contest.getContest()
  if (contest.contestStatus(c) !== 'running') return res.status(409).json({ error: 'Сейчас приём ответов закрыт' })

  if ((await contest.countRecentFromIp(req.ip, Date.now() - GUESS_LIMIT.windowMs)) >= GUESS_LIMIT.max)
    return res.status(429).json({ error: 'Слишком много ответов с этого устройства. Попробуйте позже.' })

  const name = String(req.body?.name ?? '').trim().replace(/\s+/g, ' ')
  const amount = Number(req.body?.amount)
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Укажите имя (2–60 символов)' })
  if (!Number.isInteger(amount) || amount < 0 || amount > 10_000_000)
    return res.status(400).json({ error: 'Сумма должна быть целым числом от 0 до 10 000 000' })

  // Номер берём только из подтверждения — ввести чужой номер вручную нельзя
  const v = await verification.getVerification(req.body?.token)
  if (verification.verificationStatus(v) !== 'verified')
    return res.status(403).json({ error: 'Подтвердите номер телефона ещё раз', code: 'VERIFY_AGAIN' })
  if (!(await verification.claimVerification(v.token)))
    return res.status(403).json({ error: 'Это подтверждение уже использовано', code: 'VERIFY_AGAIN' })

  try {
    await contest.insertGuess({
      round: c.round,
      name,
      phone: v.phone,
      amount,
      ip: req.ip,
      tgUserId: v.tg_user_id,
      tgUsername: v.tg_username,
    })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Вы уже участвуете: с этого номера или Telegram-аккаунта ответ уже отправлен' })
    throw err
  }
  res.status(201).json({ ok: true, participants: await contest.countGuesses(c.round) })
})

// ---------- Админка ----------

app.post('/api/admin/login', async (req, res) => {
  if (!isPasswordStrong())
    return res.status(503).json({ error: 'Вход отключён: задайте ADMIN_PASSWORD длиной от 12 символов' })
  const left = await assertNotLocked('password', req.ip)
  if (!checkPassword(req.body?.password ?? '')) {
    await recordFailure('password', req.ip)
    const hint = left > 1 ? ` Осталось попыток: ${left - 1}.` : ' Следующая ошибка заблокирует вход на 15 минут.'
    return res.status(401).json({ error: `Неверный пароль.${hint}` })
  }
  if (!twoFactorEnabled()) return res.json({ token: issueToken() })

  const { id, delivered } = await createChallenge()
  if (!delivered) return res.status(502).json({ error: 'Не удалось отправить код в Telegram. Проверьте TELEGRAM_ADMIN_IDS.' })
  res.json({ challenge: id })
})

app.post('/api/admin/login/code', async (req, res) => {
  await assertNotLocked('code', req.ip)
  if (!(await verifyChallenge(req.body?.challenge, req.body?.code ?? ''))) {
    await recordFailure('code', req.ip)
    return res.status(401).json({ error: 'Неверный код' })
  }
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
  const header = ['Имя', 'Телефон', 'Telegram', 'Ответ (сомони)', 'Разница', 'Время']
  const lines = rows.map((g) =>
    [g.name, `+${g.phone}`, g.tg_username ? `@${g.tg_username}` : '', g.amount, g.diff ?? '', new Date(g.created_at).toISOString()]
      .map(esc)
      .join(','),
  )
  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', `attachment; filename="guesses-round-${c.round}.csv"`)
  res.send('﻿' + [header.map(esc).join(','), ...lines].join('\n'))
})

app.get('/api/admin/telegram', async (req, res) => {
  if (!telegramEnabled()) return res.json({ enabled: false, devVerification: devVerification(), twoFactor: false })
  const [bot, info] = await Promise.all([getBot(), callTelegram('getWebhookInfo')])
  res.json({
    enabled: true,
    username: bot.username,
    twoFactor: twoFactorEnabled(),
    webhook: { url: info.url || null, pending: info.pending_update_count, lastError: info.last_error_message || null },
  })
})

app.post('/api/admin/telegram/webhook', async (req, res) => {
  if (!telegramEnabled()) return res.status(409).json({ error: 'Сначала задайте TELEGRAM_BOT_TOKEN' })
  const url = `${req.protocol}://${req.get('host')}/api/telegram/webhook`
  if (!url.startsWith('https://'))
    return res.status(409).json({ error: 'Вебхук работает только по https (на Vercel). Локально используйте TELEGRAM_POLLING=1' })
  await callTelegram('setWebhook', { url, secret_token: webhookSecret(), allowed_updates: ['message'], drop_pending_updates: true })
  res.json({ ok: true, url })
})

app.use('/api', (req, res) => res.status(404).json({ error: 'Не найдено' }))

app.use((err, req, res, _next) => {
  if (err instanceof TooManyAttempts) return res.status(429).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Ошибка сервера' })
})

if (!isPasswordStrong()) console.warn('⚠️  ADMIN_PASSWORD не задан или короче 12 символов — вход в админку отключён')
if (!telegramEnabled()) console.warn('ℹ️  TELEGRAM_BOT_TOKEN не задан — номер подтверждается заглушкой (только локально)')

export default app

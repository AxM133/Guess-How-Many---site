import { createHash } from 'node:crypto'

// Тонкая обёртка над Telegram Bot API

const botToken = () => process.env.TELEGRAM_BOT_TOKEN || ''
// Можно указать свой Bot API сервер; по умолчанию — официальный
const apiUrl = () => process.env.TELEGRAM_API_URL || 'https://api.telegram.org'

export const telegramEnabled = () => Boolean(botToken())

/** ID админов в Telegram, которым бот шлёт коды входа (TELEGRAM_ADMIN_IDS=123,456) */
export const adminTelegramIds = () =>
  (process.env.TELEGRAM_ADMIN_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export const twoFactorEnabled = () => telegramEnabled() && adminTelegramIds().length > 0

export async function callTelegram(method, payload = {}) {
  const res = await fetch(`${apiUrl()}/bot${botToken()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description || res.status}`)
  return data.result
}

let bot
/** Данные бота (username и т.д.), кешируются на время жизни процесса */
export function getBot() {
  bot ??= callTelegram('getMe').catch((err) => {
    bot = undefined
    throw err
  })
  return bot
}

/** Секрет, которым Telegram подписывает запросы к вебхуку (заголовок X-Telegram-Bot-Api-Secret-Token) */
export const webhookSecret = () => createHash('sha256').update(`ghm-webhook:${botToken()}`).digest('hex')

export const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

export const sendMessage = (chatId, text, extra = {}) =>
  callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra })

/** Адрес сайта для кнопки «Вернуться на сайт» в боте (только https) */
export function siteUrl() {
  const url =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  return url?.startsWith('https://') ? url : null
}

// Локальный запуск: API + (после `npm run build`) собранный сайт на одном порту.
// На Vercel этот файл не используется — там точка входа api/index.js.
import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'
import { handleUpdate } from './bot.js'
import { callTelegram, telegramEnabled } from './telegram.js'

const PORT = Number(process.env.PORT) || 3001
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const server = express()
server.use(app)
if (existsSync(DIST)) {
  server.use(express.static(DIST))
  server.get('/{*path}', (req, res) => res.sendFile(join(DIST, 'index.html')))
}
server.listen(PORT, () => console.log(`API: http://localhost:${PORT}`))

// Telegram не достучится до localhost, поэтому локально бот получает сообщения сам (long polling).
// Используйте отдельного тестового бота: polling отключает вебхук того бота, чей токен задан.
async function pollTelegram() {
  await callTelegram('deleteWebhook')
  console.log('Telegram: long polling запущен')
  let offset = 0
  for (;;) {
    try {
      const updates = await callTelegram('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] })
      for (const u of updates) {
        offset = u.update_id + 1
        await handleUpdate(u).catch((err) => console.error('telegram update failed', err))
      }
    } catch (err) {
      console.error(err.message)
      await new Promise((r) => setTimeout(r, 3000))
    }
  }
}
if (process.env.TELEGRAM_POLLING === '1' && telegramEnabled()) pollTelegram()

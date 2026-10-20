// Локальный запуск: API + (после `npm run build`) собранный сайт на одном порту.
// На Vercel этот файл не используется — там точка входа api/index.js.
import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'

const PORT = Number(process.env.PORT) || 3001
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const server = express()
server.use(app)
if (existsSync(DIST)) {
  server.use(express.static(DIST))
  server.get('/{*path}', (req, res) => res.sendFile(join(DIST, 'index.html')))
}
server.listen(PORT, () => console.log(`API: http://localhost:${PORT}`))

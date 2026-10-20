import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// На Vercel — Neon Postgres (DATABASE_URL). Локально без DATABASE_URL — PGlite:
// тот же Postgres, но встроенный и хранящийся в папке data/, ничего ставить не нужно.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS contest (
    id            INT PRIMARY KEY CHECK (id = 1),
    round         INT NOT NULL DEFAULT 1,
    starts_at     DOUBLE PRECISION,
    ends_at       DOUBLE PRECISION,
    actual_amount INT,
    revealed      BOOLEAN NOT NULL DEFAULT FALSE
  )`,
  `INSERT INTO contest (id) VALUES (1) ON CONFLICT (id) DO NOTHING`,
  `CREATE TABLE IF NOT EXISTS guesses (
    id         SERIAL PRIMARY KEY,
    round      INT NOT NULL,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    amount     INT NOT NULL,
    created_at DOUBLE PRECISION NOT NULL,
    ip         TEXT,
    UNIQUE (round, phone)
  )`,
  `CREATE INDEX IF NOT EXISTS guesses_ip_created_idx ON guesses (ip, created_at)`,
]

async function connect() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (url) {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(url)
    return (text, params = []) => sql.query(text, params)
  }
  if (process.env.VERCEL) throw new Error('На Vercel нужна переменная DATABASE_URL (подключите Neon Postgres)')
  const { PGlite } = await import('@electric-sql/pglite')
  const dir = process.env.PGLITE_DIR || join(ROOT, 'data', 'pglite')
  mkdirSync(dir, { recursive: true })
  const db = new PGlite(dir)
  return async (text, params = []) => (await db.query(text, params)).rows
}

let ready

/** Выполнить SQL-запрос и получить строки. Схема создаётся при первом обращении. */
export async function query(text, params) {
  ready ??= connect()
    .then(async (run) => {
      for (const statement of SCHEMA) await run(statement)
      return run
    })
    .catch((err) => {
      ready = undefined
      throw err
    })
  const run = await ready
  return run(text, params)
}

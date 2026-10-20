import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { KeyRound, Loader2, Lock, Send } from 'lucide-react'
import { adminApi, adminSession } from '@/shared/api'

// Вход в два шага: пароль → (если включено) 6-значный код, который бот прислал админу в Telegram
export function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function attempt(action) {
    setLoading(true)
    setError(null)
    try {
      const res = await action()
      if (res.token) {
        adminSession.set(res.token)
        onLogin()
      } else if (res.challenge) {
        setChallenge(res.challenge)
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
      // код просрочен или попытки кончились — начинаем с пароля
      if (challenge && err.status === 429) {
        setChallenge(null)
        setCode('')
      }
    } finally {
      setLoading(false)
    }
  }

  function submit(e) {
    e.preventDefault()
    attempt(() => (challenge ? adminApi.loginCode(challenge, code) : adminApi.login(password)))
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass w-full max-w-sm rounded-3xl p-8"
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-alif/10 ring-1 ring-alif/20">
        {challenge ? <KeyRound className="size-6 text-alif" /> : <Lock className="size-6 text-alif" />}
      </div>
      <h1 className="font-display text-2xl font-bold">Админ-панель</h1>

      <AnimatePresence mode="wait" initial={false}>
        {challenge ? (
          <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
              <Send className="size-4 text-[#229ED9]" /> Бот отправил код в Telegram
            </p>
            <input
              className="field mt-6 text-center font-display text-2xl font-bold tracking-[0.5em] tabular-nums"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </motion.div>
        ) : (
          <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <p className="mt-1 text-sm text-white/50">Конкурс «Угадай сумму»</p>
            <input
              type="password"
              className="field mt-6"
              placeholder="Пароль"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <button
        className="btn btn-primary mt-5 w-full"
        disabled={loading || (challenge ? code.length !== 6 : !password)}
      >
        {loading && <Loader2 className="size-4 animate-spin" />} {challenge ? 'Подтвердить' : 'Войти'}
      </button>
      {challenge && (
        <button
          type="button"
          className="mt-3 w-full text-sm text-white/40 hover:text-white"
          onClick={() => {
            setChallenge(null)
            setCode('')
            setError(null)
          }}
        >
          Назад к паролю
        </button>
      )}
    </motion.form>
  )
}

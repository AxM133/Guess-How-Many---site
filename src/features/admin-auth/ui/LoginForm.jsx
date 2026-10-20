import { useState } from 'react'
import { motion } from 'motion/react'
import { Loader2, Lock } from 'lucide-react'
import { adminApi, adminSession } from '@/shared/api'

export function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token } = await adminApi.login(password)
      adminSession.set(token)
      onLogin()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="glass w-full max-w-sm rounded-3xl p-8"
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-alif/10 ring-1 ring-alif/20">
        <Lock className="size-6 text-alif" />
      </div>
      <h1 className="font-display text-2xl font-bold">Админ-панель</h1>
      <p className="mt-1 text-sm text-white/50">Конкурс «Угадай сумму»</p>
      <input
        type="password"
        className="field mt-6"
        placeholder="Пароль"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <button className="btn btn-primary mt-5 w-full" disabled={loading || !password}>
        {loading && <Loader2 className="size-4 animate-spin" />} Войти
      </button>
    </motion.form>
  )
}

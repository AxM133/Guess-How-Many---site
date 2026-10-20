import { useCallback, useEffect, useRef, useState } from 'react'
import { verifyApi } from '@/shared/api'
import { clearVerification, loadVerification, saveVerification } from '../lib/verificationStorage'

const POLL_MS = 2000

function initialState() {
  const saved = loadVerification()
  return saved ? { ...saved, status: 'pending' } : { status: 'idle' }
}

/**
 * Подтверждение номера через Telegram-бота.
 * status: idle → starting → pending (ждём «Поделиться номером» в боте) → verified | expired
 * onVerified(name) вызывается один раз, когда номер подтверждён (подставить имя из Telegram).
 */
export function useVerification({ onVerified } = {}) {
  const [v, setV] = useState(initialState)
  const [error, setError] = useState(null)
  const activeToken = useRef(v.token ?? null) // ответы по старым подтверждениям игнорируем

  const check = useCallback(
    (token) =>
      verifyApi
        .status(token)
        .then((res) => {
          if (activeToken.current !== token) return
          if (res.status === 'verified') {
            activeToken.current = null // больше не опрашиваем и не зовём onVerified повторно
            setV((cur) => ({ ...cur, status: 'verified', phone: res.phone }))
            onVerified?.(res.name)
          } else if (res.status === 'expired') {
            activeToken.current = null
            clearVerification()
            setV({ status: 'expired' })
          }
        })
        .catch(() => {}), // сеть моргнула — проверим на следующем тике
    [onVerified],
  )

  // Пока ждём — опрашиваем сервер и сразу проверяем, когда человек вернулся из Telegram
  const waitingToken = v.status === 'pending' ? v.token : null
  useEffect(() => {
    if (!waitingToken) return
    const tick = () => check(waitingToken)
    const id = setInterval(tick, POLL_MS)
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    tick()
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [waitingToken, check])

  const start = useCallback(async () => {
    setError(null)
    setV({ status: 'starting' })
    try {
      const res = await verifyApi.start()
      const next = { token: res.token, botUrl: res.botUrl ?? null, dev: Boolean(res.dev), expiresAt: res.expiresAt }
      saveVerification(next)
      activeToken.current = next.token
      setV({ ...next, status: 'pending' })
      return next
    } catch (err) {
      setError(err.message)
      setV({ status: 'idle' })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    activeToken.current = null
    clearVerification()
    setError(null)
    setV({ status: 'idle' })
  }, [])

  const confirmDev = useCallback(
    async (phone) => {
      setError(null)
      try {
        await verifyApi.confirmDev(v.token, phone)
        await check(v.token)
      } catch (err) {
        setError(err.message)
      }
    },
    [v.token, check],
  )

  return { ...v, error, start, reset, confirmDev }
}

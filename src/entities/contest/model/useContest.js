import { useCallback, useEffect, useRef, useState } from 'react'
import { contestApi } from '@/shared/api'

// Состояние конкурса с сервера. Время считаем по часам сервера,
// чтобы неправильно выставленные часы на телефоне не ломали отсчёт.
export function useContest(pollMs = 15000) {
  const [contest, setContest] = useState(null)
  const [error, setError] = useState(null)
  const offset = useRef(0)

  const refresh = useCallback(
    () =>
      contestApi
        .get()
        .then((data) => {
          offset.current = data.now - Date.now()
          setContest(data)
          setError(null)
        })
        .catch((e) => setError(e.message)),
    [],
  )

  useEffect(() => {
    const id = setInterval(refresh, pollMs)
    refresh()
    return () => clearInterval(id)
  }, [refresh, pollMs])

  const serverNow = useCallback(() => Date.now() + offset.current, [])

  return { contest, error, refresh, serverNow }
}

export function useNow(serverNow, active = true) {
  const [now, setNow] = useState(() => serverNow())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(serverNow()), 250)
    return () => clearInterval(id)
  }, [serverNow, active])
  return now
}

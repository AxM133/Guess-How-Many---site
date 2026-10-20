import { useCallback, useEffect, useRef, useState } from 'react'
import { adminApi } from '@/shared/api'

// Данные админки: опрос сервера каждые 5 с, «живые» часы по серверному времени
// и run() — выполнить действие, показать тост и перезагрузить данные.
export function useAdminDashboard({ onUnauthorized, notify }) {
  const [state, setState] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const offset = useRef(0)

  const handleError = useCallback(
    (err) => (err.status === 401 ? onUnauthorized() : notify(err.message, { error: true })),
    [onUnauthorized, notify],
  )

  const load = useCallback(
    () =>
      adminApi
        .state()
        .then((data) => {
          offset.current = data.now - Date.now()
          setState(data)
        })
        .catch(handleError),
    [handleError],
  )

  const run = useCallback(
    async (action, successMessage) => {
      try {
        await action()
        if (successMessage) notify(successMessage)
        await load()
      } catch (err) {
        handleError(err)
      }
    },
    [load, notify, handleError],
  )

  useEffect(() => {
    const poll = setInterval(load, 5000)
    const tick = setInterval(() => setNow(Date.now() + offset.current), 250)
    load()
    return () => {
      clearInterval(poll)
      clearInterval(tick)
    }
  }, [load])

  return { state, now, load, run }
}

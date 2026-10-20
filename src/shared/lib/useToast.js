import { useCallback, useRef, useState } from 'react'

// Показ всплывающего сообщения; отрисовывает его <Toast /> из shared/ui
export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const show = useCallback(
    (text, { error = false } = {}) => {
      clearTimeout(timer.current)
      setToast({ text, error, id: Date.now() })
      timer.current = setTimeout(() => setToast(null), duration)
    },
    [duration],
  )
  return [toast, show]
}

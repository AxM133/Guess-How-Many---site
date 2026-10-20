import { useCallback, useState } from 'react'
import { adminSession } from '@/shared/api'

export function useAdminAuth() {
  const [authed, setAuthed] = useState(() => Boolean(adminSession.get()))
  const login = useCallback(() => setAuthed(true), [])
  const logout = useCallback(() => {
    adminSession.clear()
    setAuthed(false)
  }, [])
  return { authed, login, logout }
}

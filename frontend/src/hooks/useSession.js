import { useState, useCallback } from 'react'

export function useSession() {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('nativeeval_session_id'))

  const saveSession = useCallback((id) => {
    localStorage.setItem('nativeeval_session_id', id)
    setSessionId(id)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('nativeeval_session_id')
    setSessionId(null)
  }, [])

  return { sessionId, saveSession, clearSession }
}

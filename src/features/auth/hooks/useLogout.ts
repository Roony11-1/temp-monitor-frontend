import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useLogout() {
  const queryClient = useQueryClient()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    queryClient.clear()
  }, [queryClient])

  return logout
}

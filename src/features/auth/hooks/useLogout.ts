import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'

export function useLogout() {
  const queryClient = useQueryClient()

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await api.post(ApiConfig.auth.logout, { refreshToken })
      } catch {
        // best-effort
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    queryClient.clear()
  }, [queryClient])

  return logout
}
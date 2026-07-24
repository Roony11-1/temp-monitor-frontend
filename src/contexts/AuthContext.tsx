import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { parseJwt } from '../utils/jwt'
import type { AuthUser } from '../types'

interface AuthContextType 
{
  user: AuthUser | null
  token: string | null
  logout: () => void
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readAuthFromStorage() {
  const savedToken = localStorage.getItem('token')
  if (!savedToken) return { token: null, user: null, isAuthenticated: false }

  const claims = parseJwt(savedToken)
  if (!claims || claims.exp * 1000 <= Date.now()) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return { token: null, user: null, isAuthenticated: false }
  }

  const user: AuthUser = {
    id: Number(claims.sub),
    email: claims.email || claims.upn,
    roles: claims.roles || [],
    empresaId: claims.empresaId ?? null,
    sucursalId: claims.sucursalId ?? null,
  }
  return { token: savedToken, user, isAuthenticated: true }
}

export function AuthProvider({ children }: { children: ReactNode }) 
{
  const [state, setState] = useState(() => readAuthFromStorage())
  const queryClient = useQueryClient()

  const isSuperAdmin = state.user?.roles?.includes('SUPER_ADMIN') ?? false

  useEffect(() => {
    const sync = () => setState(readAuthFromStorage())
    window.addEventListener('auth-changed', sync)
    return () => window.removeEventListener('auth-changed', sync)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    queryClient.clear()
    setState({ token: null, user: null, isAuthenticated: false })
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ ...state, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() 
{
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

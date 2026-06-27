import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as loginApi } from '../api/auth'
import { parseJwt } from '../utils/jwt'
import type { LoginRequest, AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      const claims = parseJwt(savedToken)
      if (claims && claims.exp * 1000 > Date.now()) {
        setToken(savedToken)
        setUser({
          id: Number(claims.sub),
          email: claims.email || claims.upn,
          roles: claims.roles || [],
          empresaId: claims.empresaId ?? null,
          sucursalId: claims.sucursalId ?? null,
        })
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (data: LoginRequest) => {
    const res = await loginApi(data)
    localStorage.setItem('token', res.token)
    const claims = parseJwt(res.token)
    const userData: AuthUser = {
      id: Number(claims.sub),
      email: claims.email || res.email,
      roles: claims.roles || [],
      empresaId: claims.empresaId ?? null,
      sucursalId: claims.sucursalId ?? null,
    }
    setToken(res.token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

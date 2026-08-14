import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ApiConfig } from './ApiConfig'

const baseURL = import.meta.env.VITE_API_URL ?? ''

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
let pending: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No hay refresh token')
  }
  // Usamos axios plano para que el refresh no pase por este interceptor
  const res = await axios.post<{ token: string; refreshToken: string }>(
    `${baseURL}${ApiConfig.auth.refresh}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  localStorage.setItem('token', res.data.token)
  localStorage.setItem('refreshToken', res.data.refreshToken)
  return res.data.token
}

function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const isAuthEndpoint =
      original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login')

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pending.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`
              resolve(api(original))
            },
            reject,
          })
        })
      }

      isRefreshing = true
      try {
        const token = await refreshAccessToken()
        isRefreshing = false
        pending.forEach((cb) => cb.resolve(token))
        pending = []
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (refreshError) {
        isRefreshing = false
        pending.forEach((cb) => cb.reject(refreshError))
        pending = []
        clearSession()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)
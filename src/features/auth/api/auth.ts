import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { LoginRequest, LoginResponse } from '../../../types'

export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>(ApiConfig.auth.login, data)
  return res.data
}

export async function refresh(data: { refreshToken: string }) {
  const res = await api.post<LoginResponse>(ApiConfig.auth.refresh, data)
  return res.data
}

export async function logout(data: { refreshToken: string }) {
  await api.post(ApiConfig.auth.logout, data)
}

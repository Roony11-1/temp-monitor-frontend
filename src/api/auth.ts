import { api } from './axios'
import { ApiConfig } from './ApiConfig'
import type { LoginRequest, LoginResponse } from '../types'

export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>(ApiConfig.auth.login, data)
  return res.data
}

import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { LoginRequest, LoginResponse } from '../../../types'

export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>(ApiConfig.auth.login, data)
  return res.data
}

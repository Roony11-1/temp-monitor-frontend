import type { ApiError } from '../types/api-error'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError

  if (apiError?.response?.data?.message) {
    return apiError.response.data.message
  }

  if (apiError?.response?.data?.code) {
    return apiError.response.data.code
  }

  return apiError?.message || fallback
}

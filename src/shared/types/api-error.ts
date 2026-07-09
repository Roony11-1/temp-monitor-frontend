export interface BackendErrorResponse {
  code?: string
  message: string
  timestamp?: string
  details?: string[]
  path?: string
  traceId?: string | null
}

export type ApiError = {
  response?: {
    data: BackendErrorResponse
    status: number
  }
  message?: string
}

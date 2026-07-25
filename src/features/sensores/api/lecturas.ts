import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Lectura } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function registrarLecturaSensor(uuid: string, temperatura: number) {
  await api.post(ApiConfig.lecturas.porSensor(uuid), { temperatura })
}

export async function getLecturasSensor(uuid: string, since?: number) {
  const res = await api.get<PaginatedResponse<Lectura>>(ApiConfig.lecturas.porSensor(uuid), {
    params: { ...(since ? { since } : {}) },
  })
  return res.data.content
}

export async function getLecturasSensorPage(uuid: string, page: number, size: number, since?: number) {
  const res = await api.get<PaginatedResponse<Lectura>>(ApiConfig.lecturas.porSensor(uuid), {
    params: { page: page - 1, size, ...(since ? { since } : {}) },
  })
  return res.data
}

import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Lectura } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function registrarLecturaSensor(uuid: string, temperatura: number) {
  await api.post(ApiConfig.lecturas.porSensor(uuid), { temperatura })
}

export async function getLecturasSensor(uuid: string) {
  const res = await api.get<PaginatedResponse<Lectura>>(ApiConfig.lecturas.porSensor(uuid))
  return res.data.content
}

export async function getLecturasSensorPage(uuid: string, page: number, size: number) {
  const res = await api.get<PaginatedResponse<Lectura>>(ApiConfig.lecturas.porSensor(uuid), {
    params: { page: page - 1, size },
  })
  return res.data
}

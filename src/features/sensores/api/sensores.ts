import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Sensor, RegistroSensorRequest, RegistroSensorResponse, AsignarSensorRequest, ActualizarSensorRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function getSensores() {
  const res = await api.get<PaginatedResponse<Sensor>>(ApiConfig.sensores.list)
  return res.data.content
}

export async function getSensoresPage(page: number, size: number, filters?: Record<string, string>) {
  const params: Record<string, any> = { page: page - 1, size }
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      params[key] = value
    }
  }
  const res = await api.get<PaginatedResponse<Sensor>>(ApiConfig.sensores.list, { params })
  return res.data
}

export async function registrarSensor(data: RegistroSensorRequest) {
  const res = await api.post<RegistroSensorResponse>(ApiConfig.sensores.registrar, data)
  return res.data
}

export async function asignarSensor(data: AsignarSensorRequest) {
  const res = await api.post<Sensor>(ApiConfig.sensores.asignar, data)
  return res.data
}

export async function getSensoresByCamara(camaraId: number) {
  const res = await api.get<Sensor[]>(ApiConfig.sensores.byCamara(camaraId))
  return res.data
}

export async function actualizarSensor(uuid: string, data: ActualizarSensorRequest) {
  const res = await api.put<Sensor>(ApiConfig.sensores.byUuid(uuid), data)
  return res.data
}

export async function consultarEstadoSensor(uuid: string) {
  const res = await api.get<string>(ApiConfig.sensores.estado(uuid))
  return res.data
}

export async function renewApiKeySensor(uuid: string) {
  const res = await api.post<RegistroSensorResponse>(ApiConfig.sensores.renewApiKey(uuid))
  return res.data
}

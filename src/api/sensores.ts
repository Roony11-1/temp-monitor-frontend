import { api } from './axios'
import { ApiConfig } from './ApiConfig'
import type { Sensor, RegistroSensorRequest, RegistroSensorResponse, AsignarSensorRequest, ActualizarSensorRequest, Lectura } from '../types'

export async function getSensores() {
  const res = await api.get<Sensor[]>(ApiConfig.sensores.list)
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

export async function registrarLecturaSensor(uuid: string, temperatura: number) {
  await api.post(ApiConfig.sensores.lecturas(uuid), { temperatura })
}

export async function consultarEstadoSensor(uuid: string) {
  const res = await api.get<string>(ApiConfig.sensores.estado(uuid))
  return res.data
}

export async function getLecturasSensor(uuid: string) {
  const res = await api.get<Lectura[]>(ApiConfig.sensores.lecturas(uuid))
  return res.data
}

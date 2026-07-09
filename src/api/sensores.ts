import { api } from './axios'
import { ApiConfig } from './ApiConfig'
import type { Sensor, RegistroSensorRequest } from '../types'

export async function registrarSensor(data: RegistroSensorRequest) {
  const res = await api.post<Sensor>(ApiConfig.sensores.registrar, data)
  return res.data
}

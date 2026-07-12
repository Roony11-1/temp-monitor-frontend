import { api } from './axios'
import { ApiConfig } from './ApiConfig'
import type { Lectura } from '../types'

export async function registrarLecturaSensor(uuid: string, temperatura: number) {
  await api.post(ApiConfig.lecturas.porSensor(uuid), { temperatura })
}

export async function getLecturasSensor(uuid: string) {
  const res = await api.get<Lectura[]>(ApiConfig.lecturas.porSensor(uuid))
  return res.data
}

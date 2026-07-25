import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Camara, CamaraRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function getCamaras() {
  const res = await api.get<PaginatedResponse<Camara>>(ApiConfig.camaras.list)
  return res.data.content
}

export async function getCamarasPage(page: number, size: number) {
  const res = await api.get<PaginatedResponse<Camara>>(ApiConfig.camaras.list, {
    params: { page: page - 1, size },
  })
  return res.data
}

export async function getCamarasBySucursal(sucursalId: number) {
  const res = await api.get<Camara[]>(ApiConfig.camaras.bySucursal(sucursalId))
  return res.data
}

export async function getCamara(id: number) {
  const res = await api.get<Camara>(ApiConfig.camaras.byId(id))
  return res.data
}

export async function createCamara(data: CamaraRequest) {
  const res = await api.post<Camara>(ApiConfig.camaras.list, data)
  return res.data
}

export async function updateCamara(id: number, data: CamaraRequest) {
  const res = await api.put<Camara>(ApiConfig.camaras.byId(id), data)
  return res.data
}

export async function deleteCamara(id: number) {
  await api.delete(ApiConfig.camaras.byId(id))
}

export async function activarCamara(id: number) {
  await api.post(ApiConfig.camaras.activar(id))
}

export async function desactivarCamara(id: number) {
  await api.post(ApiConfig.camaras.desactivar(id))
}

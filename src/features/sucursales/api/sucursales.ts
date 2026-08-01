import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Sucursal, SucursalRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function getSucursales() {
  const res = await api.get<PaginatedResponse<Sucursal>>(ApiConfig.sucursales.list)
  return res.data.content
}

export async function getSucursalesPage(page: number, size: number, filters?: Record<string, string>) {
  const params: Record<string, any> = { page: page - 1, size }
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      const mappedKey = key === 'empresa' ? 'empresa.nombre' : key
      params[mappedKey] = value
    }
  }
  const res = await api.get<PaginatedResponse<Sucursal>>(ApiConfig.sucursales.list, { params })
  return res.data
}

export async function getSucursalesByEmpresa(empresaId: number) {
  const res = await api.get<Sucursal[]>(ApiConfig.sucursales.byEmpresa(empresaId))
  return res.data
}

export async function getSucursal(id: number) {
  const res = await api.get<Sucursal>(ApiConfig.sucursales.byId(id))
  return res.data
}

export async function createSucursal(data: SucursalRequest) {
  const res = await api.post<Sucursal>(ApiConfig.sucursales.list, data)
  return res.data
}

export async function updateSucursal(id: number, data: SucursalRequest) {
  const res = await api.put<Sucursal>(ApiConfig.sucursales.byId(id), data)
  return res.data
}

export async function deleteSucursal(id: number) {
  await api.delete(ApiConfig.sucursales.byId(id))
}

export async function activarSucursal(id: number) {
  await api.post(ApiConfig.sucursales.activar(id))
}

export async function desactivarSucursal(id: number) {
  await api.post(ApiConfig.sucursales.desactivar(id))
}

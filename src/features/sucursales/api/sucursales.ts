import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Sucursal, SucursalRequest } from '../../../types'

export async function getSucursales() {
  const res = await api.get<Sucursal[]>(ApiConfig.sucursales.list)
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

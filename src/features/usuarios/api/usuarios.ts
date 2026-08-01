import { api } from '../../../api/axios'
import { ApiConfig } from '../../../api/ApiConfig'
import type { Usuario, UsuarioRequest, UsuarioSummaryResponse } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

export async function getUsuarios() {
  const res = await api.get<PaginatedResponse<UsuarioSummaryResponse>>(ApiConfig.usuarios.list)
  return res.data.content
}

export async function getUsuariosPage(page: number, size: number, filters?: Record<string, string>) {
  const params: Record<string, any> = { page: page - 1, size }
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      const mappedKey =
        key === 'empresa' ? 'empresa.nombre' :
        key === 'sucursal' ? 'sucursal.nombre' :
        key
      params[mappedKey] = value
    }
  }
  const res = await api.get<PaginatedResponse<UsuarioSummaryResponse>>(ApiConfig.usuarios.list, { params })
  return res.data
}

export async function getUsuariosByEmpresa(empresaId: number) {
  const res = await api.get<Usuario[]>(ApiConfig.usuarios.byEmpresa(empresaId))
  return res.data
}

export async function getUsuariosBySucursal(sucursalId: number) {
  const res = await api.get<Usuario[]>(ApiConfig.usuarios.bySucursal(sucursalId))
  return res.data
}

export async function getUsuario(id: number) {
  const res = await api.get<Usuario>(ApiConfig.usuarios.byId(id))
  return res.data
}

export async function createUsuario(data: UsuarioRequest) {
  const res = await api.post<Usuario>(ApiConfig.usuarios.list, data)
  return res.data
}

export async function updateUsuario(id: number, data: Omit<UsuarioRequest, 'password'>) {
  const res = await api.put<Usuario>(ApiConfig.usuarios.byId(id), data)
  return res.data
}

export async function deleteUsuario(id: number) {
  await api.delete(ApiConfig.usuarios.byId(id))
}

export async function activarUsuario(id: number) {
  await api.post(ApiConfig.usuarios.activar(id))
}

export async function desactivarUsuario(id: number) {
  await api.post(ApiConfig.usuarios.desactivar(id))
}

export async function cambiarPassword(id: number, nuevaPassword: string) {
  await api.post(ApiConfig.usuarios.password(id), { nuevaPassword })
}

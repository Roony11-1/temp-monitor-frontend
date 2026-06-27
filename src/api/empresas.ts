import { api } from './axios'
import { ApiConfig } from './ApiConfig'
import type { Empresa, EmpresaRequest } from '../types'

export async function getEmpresas() {
  const res = await api.get<Empresa[]>(ApiConfig.empresas.list)
  return res.data
}

export async function getEmpresa(id: number) {
  const res = await api.get<Empresa>(ApiConfig.empresas.byId(id))
  return res.data
}

export async function createEmpresa(data: EmpresaRequest) {
  const res = await api.post<Empresa>(ApiConfig.empresas.list, data)
  return res.data
}

export async function updateEmpresa(id: number, data: EmpresaRequest) {
  const res = await api.put<Empresa>(ApiConfig.empresas.byId(id), data)
  return res.data
}

export async function deleteEmpresa(id: number) {
  await api.delete(ApiConfig.empresas.byId(id))
}

export async function activarEmpresa(id: number) {
  await api.post(ApiConfig.empresas.activar(id))
}

export async function desactivarEmpresa(id: number) {
  await api.post(ApiConfig.empresas.desactivar(id))
}

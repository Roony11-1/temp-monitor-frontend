import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/empresas'
import type { EmpresaRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'
import type { Empresa } from '../../../types'

const queryKey = 'empresas'

export function useEmpresas() {
  return useQuery({
    queryKey: [queryKey],
    queryFn: api.getEmpresas,
  })
}

export function useEmpresasPage(page: number, pageSize: number) {
  return useQuery<PaginatedResponse<Empresa>>({
    queryKey: [queryKey, 'page', page, pageSize],
    queryFn: () => api.getEmpresasPage(page, pageSize),
    placeholderData: (prev) => prev,
  })
}

export function useEmpresa(id: number) {
  return useQuery({
    queryKey: [queryKey, id],
    queryFn: () => api.getEmpresa(id),
    enabled: !!id,
  })
}

export function useCreateEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmpresaRequest) => api.createEmpresa(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useUpdateEmpresa(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmpresaRequest) => api.updateEmpresa(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useDeleteEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteEmpresa(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useToggleEmpresa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? api.activarEmpresa(id) : api.desactivarEmpresa(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

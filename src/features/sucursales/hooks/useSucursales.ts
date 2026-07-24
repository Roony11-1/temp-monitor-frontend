import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/sucursales'
import type { SucursalRequest } from '../../../types'

const queryKey = 'sucursales'

export function useSucursales() {
  return useQuery({
    queryKey: [queryKey],
    queryFn: api.getSucursales,
  })
}

export function useSucursalesByEmpresa(empresaId: number) {
  return useQuery({
    queryKey: [queryKey, 'empresa', empresaId],
    queryFn: () => api.getSucursalesByEmpresa(empresaId),
    enabled: !!empresaId,
  })
}

export function useSucursal(id: number) {
  return useQuery({
    queryKey: [queryKey, id],
    queryFn: () => api.getSucursal(id),
    enabled: !!id,
  })
}

export function useCreateSucursal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SucursalRequest) => api.createSucursal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useUpdateSucursal(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SucursalRequest) => api.updateSucursal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useDeleteSucursal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteSucursal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

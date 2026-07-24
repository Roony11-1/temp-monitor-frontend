import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/camaras'
import type { CamaraRequest } from '../../../types'

const queryKey = 'camaras'

export function useCamaras() {
  return useQuery({
    queryKey: [queryKey],
    queryFn: api.getCamaras,
  })
}

export function useCamarasBySucursal(sucursalId: number) {
  return useQuery({
    queryKey: [queryKey, 'sucursal', sucursalId],
    queryFn: () => api.getCamarasBySucursal(sucursalId),
    enabled: !!sucursalId,
  })
}

export function useCamara(id: number) {
  return useQuery({
    queryKey: [queryKey, id],
    queryFn: () => api.getCamara(id),
    enabled: !!id,
  })
}

export function useCreateCamara() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CamaraRequest) => api.createCamara(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useUpdateCamara(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CamaraRequest) => api.updateCamara(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useDeleteCamara() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteCamara(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

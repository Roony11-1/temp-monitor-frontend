import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/camaras'
import type { CamaraRequest, CamaraSummaryResponse, CamaraLectura, CamaraLecturaResumen } from '../../../types'
import type { GranularidadLectura } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'
import { CADENCIA_MUESTRA_MS } from '../../../shared/config/camaraMuestreo'

const queryKey = 'camaras'

export function useCamaras() {
  return useQuery({
    queryKey: [queryKey],
    queryFn: api.getCamaras,
    refetchInterval: 60_000,
  })
}

export function useCamarasPage(page: number, pageSize: number, filters?: Record<string, string>) {
  return useQuery<PaginatedResponse<CamaraSummaryResponse>>({
    queryKey: [queryKey, 'page', page, pageSize, JSON.stringify(filters ?? {})],
    queryFn: () => api.getCamarasPage(page, pageSize, filters),
    placeholderData: (prev) => prev,
    refetchInterval: 60_000,
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

export function useUltimasLecturas(id: number) {
  return useQuery({
    queryKey: [queryKey, id, 'ultimas-lecturas'],
    queryFn: () => api.getUltimasLecturas(id),
    enabled: !!id,
    refetchInterval: 60_000,
  })
}

export function useCamaraLecturas(id: number, since?: number) {
  return useQuery<CamaraLectura[]>({
    queryKey: [queryKey, id, 'lecturas', ...(since ? [since] : [])],
    queryFn: () => api.getCamaraLecturas(id, since),
    enabled: !!id,
    refetchInterval: (query) => {
      const lecturas = query.state.data
      if (!lecturas || lecturas.length === 0) return CADENCIA_MUESTRA_MS
      const ultima = lecturas[lecturas.length - 1]
      const siguiente = new Date(ultima.muestreadoEn).getTime() + CADENCIA_MUESTRA_MS
      return Math.max(1_000, siguiente - Date.now())
    },
  })
}

export function useCamaraLecturasResumen(id: number, granularidad: GranularidadLectura, enabled = true) {
  return useQuery<CamaraLecturaResumen[]>({
    queryKey: [queryKey, id, 'lecturas', 'resumen', granularidad],
    queryFn: () => api.getCamaraLecturasResumen(id, granularidad),
    enabled: !!id && enabled,
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

export function useRestaurarCamara() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.restaurarCamara(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

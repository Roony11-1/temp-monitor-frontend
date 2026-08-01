import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/usuarios'
import type { UsuarioRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'
import type { Usuario } from '../../../types'

const queryKey = 'usuarios'

export function useUsuarios() {
  return useQuery({ queryKey: [queryKey], queryFn: api.getUsuarios })
}

export function useUsuariosPage(page: number, pageSize: number, filters?: Record<string, string>) {
  return useQuery<PaginatedResponse<Usuario>>({
    queryKey: [queryKey, 'page', page, pageSize, JSON.stringify(filters ?? {})],
    queryFn: () => api.getUsuariosPage(page, pageSize, filters),
    placeholderData: (prev) => prev,
  })
}

export function useUsuariosByEmpresa(empresaId: number) {
  return useQuery({
    queryKey: [queryKey, 'empresa', empresaId],
    queryFn: () => api.getUsuariosByEmpresa(empresaId),
    enabled: !!empresaId,
  })
}

export function useUsuariosBySucursal(sucursalId: number) {
  return useQuery({
    queryKey: [queryKey, 'sucursal', sucursalId],
    queryFn: () => api.getUsuariosBySucursal(sucursalId),
    enabled: !!sucursalId,
  })
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: [queryKey, id],
    queryFn: () => api.getUsuario(id),
    enabled: !!id,
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UsuarioRequest) => api.createUsuario(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useUpdateUsuario(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<UsuarioRequest, 'password'>) => api.updateUsuario(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useCambiarPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nuevaPassword }: { id: number; nuevaPassword: string }) =>
      api.cambiarPassword(id, nuevaPassword),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

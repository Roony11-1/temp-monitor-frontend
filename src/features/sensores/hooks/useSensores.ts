import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/sensores'
import * as lecturasApi from '../api/lecturas'
import type { Sensor, Lectura, RegistroSensorRequest, AsignarSensorRequest, ActualizarSensorRequest } from '../../../types'
import type { PaginatedResponse } from '../../../types/table'

const queryKey = 'sensores'

export function useSensores() {
  return useQuery({ queryKey: [queryKey], queryFn: api.getSensores })
}

export function useSensoresPage(page: number, pageSize: number) {
  return useQuery<PaginatedResponse<Sensor>>({
    queryKey: [queryKey, 'page', page, pageSize],
    queryFn: () => api.getSensoresPage(page, pageSize),
    placeholderData: (prev) => prev,
  })
}

export function useSensoresByCamara(camaraId: number) {
  return useQuery({
    queryKey: [queryKey, 'camara', camaraId],
    queryFn: () => api.getSensoresByCamara(camaraId),
    enabled: !!camaraId,
  })
}

export function useConsultarEstadoSensor(uuid: string) {
  return useQuery({
    queryKey: [queryKey, 'estado', uuid],
    queryFn: () => api.consultarEstadoSensor(uuid),
    enabled: !!uuid,
  })
}

export function useRegistrarSensor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegistroSensorRequest) => api.registrarSensor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useAsignarSensor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AsignarSensorRequest) => api.asignarSensor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useActualizarSensor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: ActualizarSensorRequest }) => api.actualizarSensor(uuid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [queryKey] }),
  })
}

export function useLecturasSensor(uuid: string, since?: number) {
  return useQuery({
    queryKey: ['lecturas', uuid, ...(since ? ['since', since] : [])],
    queryFn: () => lecturasApi.getLecturasSensor(uuid, since),
    enabled: !!uuid,
  })
}

export function useLecturasSensorPage(uuid: string, page: number, pageSize: number, since?: number) {
  return useQuery<PaginatedResponse<Lectura>>({
    queryKey: ['lecturas', uuid, 'page', page, pageSize, ...(since ? ['since', since] : [])],
    queryFn: () => lecturasApi.getLecturasSensorPage(uuid, page, pageSize, since),
    enabled: !!uuid,
    placeholderData: (prev) => prev,
  })
}

export function useRegistrarLecturaSensor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, temperatura }: { uuid: string; temperatura: number }) =>
      lecturasApi.registrarLecturaSensor(uuid, temperatura),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lecturas'] }),
  })
}

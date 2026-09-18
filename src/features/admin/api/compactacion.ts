import { api } from '../../../api/axios'

export type EstadoCompactionJob = 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface CompactionJob {
  id: string
  estado: EstadoCompactionJob
  iniciadoEn: string
  terminadoEn?: string | null
  ejecutadoPorId?: number | null
  ejecutadoPorEmail?: string | null
  totalDiarios?: number | null
  totalMensuales?: number | null
  totalPurgados?: number | null
  detalleJson?: string | null
  error?: string | null
}

export interface CompactionDetalle {
  name: string
  diarios: number
  mensuales: number
  purgados: number
}

export async function ejecutarCompactacion(): Promise<CompactionJob> {
  const { data } = await api.post<CompactionJob>('/api/admin/compactacion/ejecutar')
  return data
}

export async function fetchCompactacionJob(id: string): Promise<CompactionJob> {
  const { data } = await api.get<CompactionJob>(`/api/admin/compactacion/${id}`)
  return data
}

export async function fetchUltimosJobs(): Promise<CompactionJob[]> {
  const { data } = await api.get<CompactionJob[]>('/api/admin/compactacion')
  return data
}

export function parseDetalle(job: CompactionJob): CompactionDetalle[] {
  if (!job.detalleJson) return []
  try {
    return JSON.parse(job.detalleJson) as CompactionDetalle[]
  } catch {
    return []
  }
}

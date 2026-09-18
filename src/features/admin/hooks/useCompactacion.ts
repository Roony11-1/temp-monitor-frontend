import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ejecutarCompactacion, fetchCompactacionJob, fetchUltimosJobs } from '../api/compactacion'

export function useCompactacion() {
  const queryClient = useQueryClient()

  const listarQuery = useQuery({
    queryKey: ['compactacion', 'listar'],
    queryFn: fetchUltimosJobs,
    refetchInterval: 10000,
  })

  const ejecutarMutation = useMutation({
    mutationFn: ejecutarCompactacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compactacion'] })
    },
  })

  return {
    jobs: listarQuery.data ?? [],
    jobsLoading: listarQuery.isLoading,
    jobsError: listarQuery.error as Error | null,
    refetchJobs: listarQuery.refetch,
    ejecutar: ejecutarMutation.mutateAsync,
    isEjecutando: ejecutarMutation.isPending,
    ejecutarError: ejecutarMutation.error as Error | null,
  }
}

export function useCompactacionJob(jobId: string | null) {
  return useQuery({
    queryKey: ['compactacion', jobId],
    queryFn: () => fetchCompactacionJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as unknown as { estado?: string } | undefined
      return data?.estado === 'RUNNING' ? 2000 : false
    },
  })
}

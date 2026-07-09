import { useState, useEffect } from 'react'
import { fetchDashboardData, type DashboardData } from '../api/dashboard'

interface UseDashboardResult {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchDashboardData()
      .then(setData)
      .catch((err) => setError(err?.message || 'Error al cargar dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return { data, loading, error, refetch: load }
}

import { useSearchParams } from 'react-router-dom'

const NON_FILTER_PARAMS = new Set(['page', 'pageSize', 'sort'])

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!NON_FILTER_PARAMS.has(key) && value !== '') {
      filters[key] = value
    }
  }

  const setFilters = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    for (const key of Array.from(params.keys())) {
      if (!NON_FILTER_PARAMS.has(key)) params.delete(key)
    }
    for (const [key, value] of Object.entries(next)) {
      if (value !== '' && value != null) params.set(key, value)
    }
    setSearchParams(params, { replace: true })
  }

  return { filters, setFilters }
}

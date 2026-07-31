export function timeAgo(iso: string): string {
  const diffMs = new Date().getTime() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `Hace ${diffMin} min`
  if (diffHr < 24) return `Hace ${diffHr} h`
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
}

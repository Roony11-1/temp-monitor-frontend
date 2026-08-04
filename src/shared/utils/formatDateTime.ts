const ZONA = 'America/Santiago'

export function formatDateTime(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
    ...opts,
  })
}

export function formatDateTimeShort(iso: string): string {
  return formatDateTime(iso, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

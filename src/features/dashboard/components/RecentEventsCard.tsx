import { Badge } from '../../../shared/components/ui/Badge'
import { cn } from '../../../shared/utils/cn'
import type { DashboardEvent } from '../api/dashboard'

interface RecentEventsCardProps {
  events: DashboardEvent[]
}

const tipoStyles: Record<DashboardEvent['tipo'], { variant: 'danger' | 'warning' | 'info' | 'success'; dot: string }> = {
  critico: { variant: 'danger', dot: 'bg-red-500' },
  advertencia: { variant: 'warning', dot: 'bg-yellow-500' },
  info: { variant: 'info', dot: 'bg-blue-500' },
  normal: { variant: 'success', dot: 'bg-green-500' },
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export function RecentEventsCard({ events }: RecentEventsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Últimos eventos
      </h3>
      <div className="space-y-2">
        {events.map((event) => {
          const style = tipoStyles[event.tipo]
          return (
            <div
              key={event.id}
              className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              <span className={cn('size-2 rounded-full mt-1.5 shrink-0', style.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{event.mensaje}</p>
                <p className="text-xs text-gray-400 mt-0.5">{event.origen}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={style.variant} size="sm">
                  {event.tipo}
                </Badge>
                <span className="text-xs text-gray-400">{formatTimestamp(event.timestamp)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

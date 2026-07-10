import { Badge } from '../../../shared/components/ui/Badge'
import { cn } from '../../../shared/utils/cn'
import type { DashboardEvent } from '../api/dashboard'
import styles from './RecentEventsCard.module.css'

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
    <div className={styles.card}>
      <h3 className={styles.title}>
        Últimos eventos
      </h3>
      <div className={styles.list}>
        {events.map((event) => {
          const style = tipoStyles[event.tipo]
          return (
            <div
              key={event.id}
              className={styles.event}
            >
              <span className={cn(styles.dot, style.dot)} />
              <div className={styles.eventContent}>
                <p className={styles.message}>{event.mensaje}</p>
                <p className={styles.origin}>{event.origen}</p>
              </div>
              <div className={styles.eventMeta}>
                <Badge variant={style.variant} size="sm">
                  {event.tipo}
                </Badge>
                <span className={styles.time}>{formatTimestamp(event.timestamp)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

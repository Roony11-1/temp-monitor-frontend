import { Badge } from './Badge'

export type SensorEstado = 'ACTIVO' | 'DESHABILITADO' | 'PENDIENTE'

interface SensorEstadoBadgeProps {
  estado: string
  eliminado?: boolean
}

export function SensorEstadoBadge({ estado, eliminado }: SensorEstadoBadgeProps) {
  if (eliminado) {
    return <Badge variant="warning">Eliminado</Badge>
  }
  switch (estado) {
    case 'ACTIVO':
      return <Badge variant="success">Activo</Badge>
    case 'DESHABILITADO':
      return <Badge variant="danger">Deshabilitado</Badge>
    case 'PENDIENTE':
      return <Badge variant="warning">Pendiente</Badge>
    default:
      return <Badge variant="neutral">{estado}</Badge>
  }
}

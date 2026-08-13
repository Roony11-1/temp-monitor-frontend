import { Badge } from './Badge'

interface EstadoBadgeProps {
  eliminado?: boolean
  activo?: boolean
}

export function EstadoBadge({ eliminado, activo }: EstadoBadgeProps) {
  if (eliminado) {
    return <Badge variant="warning">Eliminado</Badge>
  }
  return <Badge variant={activo ? 'success' : 'danger'}>{activo ? 'Activo' : 'Inactivo'}</Badge>
}

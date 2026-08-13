import { Badge } from './Badge'
import type { BadgeVariant } from '../../types/common'
import type { Rol } from '../../../types'

const ROL_LABELS: Record<Rol, string> = {
  SUPER_ADMIN: 'Admin Global',
  ADMIN_EMPRESA: 'Admin Empresa',
  ADMIN_SUCURSAL: 'Admin Sucursal',
  USUARIO: 'Usuario',
}

const ROL_VARIANTS: Record<Rol, BadgeVariant> = {
  SUPER_ADMIN: 'danger',
  ADMIN_EMPRESA: 'info',
  ADMIN_SUCURSAL: 'warning',
  USUARIO: 'neutral',
}

interface RolBadgeProps {
  rol: Rol
}

export function RolBadge({ rol }: RolBadgeProps) {
  return <Badge variant={ROL_VARIANTS[rol]}>{ROL_LABELS[rol] ?? rol}</Badge>
}

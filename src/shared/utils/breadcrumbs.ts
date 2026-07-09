export interface BreadcrumbItem {
  label: string
  href?: string
}

const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  empresas: 'Empresas',
  sucursales: 'Sucursales',
  camaras: 'Cámaras',
  sensores: 'Sensores',
  registrar: 'Registrar Sensor',
  usuarios: 'Usuarios',
  alertas: 'Alertas',
  perfil: 'Perfil',
  configuracion: 'Configuración',
}

function labelForSegment(segment: string): string {
  return segmentLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return [{ label: 'Dashboard', href: '/dashboard' }]
  }

  const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }]

  let cumulative = ''
  for (let i = 0; i < segments.length; i++) {
    cumulative += `/${segments[i]}`
    const label = labelForSegment(segments[i])
    const isLast = i === segments.length - 1
    items.push(isLast ? { label } : { label, href: cumulative })
  }

  return items
}

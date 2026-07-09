import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from '../shared/components/ui/Badge'
import { cn } from '../shared/utils/cn'

const stroke = 'stroke-current fill-none stroke-2'

const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <rect x="2" y="2" width="7" height="7" rx="1" />
      <rect x="11" y="2" width="7" height="7" rx="1" />
      <rect x="2" y="11" width="7" height="7" rx="1" />
      <rect x="11" y="11" width="7" height="7" rx="1" />
    </svg>
  ),
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <rect x="4" y="2" width="12" height="16" rx="1" />
      <line x1="7" y1="6" x2="9" y2="6" />
      <line x1="11" y1="6" x2="13" y2="6" />
      <line x1="7" y1="9" x2="9" y2="9" />
      <line x1="11" y1="9" x2="13" y2="9" />
      <line x1="7" y1="12" x2="9" y2="12" />
      <line x1="11" y1="12" x2="13" y2="12" />
    </svg>
  ),
  Location: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" />
      <circle cx="10" cy="8" r="2.5" />
    </svg>
  ),
  Camera: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <rect x="2" y="5" width="16" height="11" rx="2" />
      <circle cx="10" cy="10.5" r="3" />
      <path d="M7 5l1.5-2h3L13 5" />
    </svg>
  ),
  Chip: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <rect x="5" y="3" width="10" height="14" rx="1.5" />
      <rect x="7" y="6" width="6" height="4" rx="0.5" />
      <line x1="5" y1="9" x2="3" y2="9" />
      <line x1="17" y1="9" x2="15" y2="9" />
      <line x1="5" y1="12" x2="3" y2="12" />
      <line x1="17" y1="12" x2="15" y2="12" />
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <circle cx="10" cy="5" r="3" />
      <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" className={stroke}>
      <path d="M14 4h3a1 1 0 011 1v10a1 1 0 01-1 1h-3" />
      <polyline points="10 13 14 10 10 7" />
      <line x1="14" y1="10" x2="3" y2="10" />
    </svg>
  ),
}

type NavItem = {
  to: string
  label: string
  icon: keyof typeof Icons
  show: boolean
}

type NavSection = {
  title?: string
  items: NavItem[]
}

export function Sidebar() {
  const { user, logout } = useAuth()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA') ?? false
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL') ?? false
  const isTecnico = user?.roles?.includes('TECNICO') ?? false

  const canManage = isSuperAdmin || isAdminEmpresa
  const canViewStructure = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const sections: NavSection[] = [
    {
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: 'Dashboard', show: true },
      ],
    },
    {
      title: 'OPERACIÓN',
      items: [
        { to: '/empresas', label: 'Empresas', icon: 'Building', show: isSuperAdmin || isAdminEmpresa },
        { to: '/sucursales', label: 'Sucursales', icon: 'Location', show: canViewStructure },
        { to: '/camaras', label: 'Cámaras', icon: 'Camera', show: canViewStructure || isAdminSucursal || isTecnico },
        { to: '/sensores/registrar', label: 'Registrar Sensor', icon: 'Chip', show: true },
      ],
    },
    {
      title: 'ADMINISTRACIÓN',
      items: [
        { to: '/usuarios', label: 'Usuarios', icon: 'Users', show: canManage || isAdminSucursal || isTecnico },
      ],
    },
  ]

  const hasVisibleItems = (section: NavSection) =>
    section.items.some((item) => item.show)

  return (
    <aside className="w-64 bg-[#0f172a] text-white flex flex-col min-h-screen select-none">
      {/* Logo / User card */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="size-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold">
            TM
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Temp Monitor</h1>
            <p className="text-[11px] text-gray-500 leading-tight">{user?.email}</p>
          </div>
        </div>
        {user?.roles && (
          <Badge variant="info" size="sm" className="ml-10">
            {user.roles.join(', ')}
          </Badge>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto" aria-label="Sidebar navigation">
        {sections.filter(hasVisibleItems).map((section) => (
          <div key={section.title ?? '__top'}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.filter((item) => item.show).map((item) => {
                const Icon = Icons[item.icon]
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          'border-l-3',
                          isActive
                            ? 'bg-indigo-500/10 text-indigo-300 border-l-indigo-400'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border-l-transparent',
                        )
                      }
                    >
                      <Icon />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 w-full transition-colors"
        >
          <Icons.Logout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

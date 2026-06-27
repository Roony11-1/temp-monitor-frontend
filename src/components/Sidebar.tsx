import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Sidebar() {
  const { user, logout } = useAuth()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const isTecnico = user?.roles?.includes('TECNICO')

  const canManage = isSuperAdmin || isAdminEmpresa
  const canViewStructure = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', show: true },
    { to: '/empresas', label: 'Empresas', icon: '🏢', show: isSuperAdmin || isAdminEmpresa },
    { to: '/sucursales', label: 'Sucursales', icon: '📍', show: canViewStructure },
    { to: '/camaras', label: 'Cámaras', icon: '📷', show: canViewStructure || isAdminSucursal || isTecnico },
    { to: '/usuarios', label: 'Usuarios', icon: '👥', show: canManage || isAdminSucursal || isTecnico },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-tight">Temp Monitor</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-indigo-600">
          {user?.roles?.join(', ')}
        </span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.filter((item) => item.show).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

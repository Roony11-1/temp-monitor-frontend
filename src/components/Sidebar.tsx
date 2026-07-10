import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../shared/utils/cn'
import styles from './Sidebar.module.css'

const navItems = [
  {
    section: 'General',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    section: 'Gestión',
    items: [
      { to: '/empresas', label: 'Empresas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { to: '/sucursales', label: 'Sucursales', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
      { to: '/camaras', label: 'Cámaras', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
      { to: '/usuarios', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    ],
  },
  {
    section: 'Configuración',
    items: [
      { to: '/sensores/registrar', label: 'Registrar Sensor', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleSections = navItems.filter(
    (s) => s.section !== 'Configuración' || isSuperAdmin,
  )

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h1 className={styles.logoTitle}>Temp Monitor</h1>
        <p className={styles.logoSubtitle}>Control de temperatura</p>
      </div>

      <nav className={styles.nav}>
        {visibleSections.map((section) => (
          <div key={section.section} className={styles.section}>
            <p className={styles.sectionTitle}>{section.section}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(styles.link, isActive ? styles.linkActive : styles.linkInactive)
                }
              >
                <svg width="18" height="18" viewBox="0 0 20 20" className={styles.linkIcon}>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userEmail}>{user?.email}</p>
            <p className={styles.userRole}>
              {user?.roles?.join(', ') || 'Sin rol'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" className={styles.logoutIcon}>
            <path d="M8 17l-6-6 6-6" />
            <line x1="2" y1="11" x2="16" y2="11" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

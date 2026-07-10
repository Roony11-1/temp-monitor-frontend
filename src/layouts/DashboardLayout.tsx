import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Breadcrumbs } from '../shared/components/ui/Breadcrumbs'
import styles from './DashboardLayout.module.css'

export function DashboardLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <header className={styles.header}>
          <Breadcrumbs />
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

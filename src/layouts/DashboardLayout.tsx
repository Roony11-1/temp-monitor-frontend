import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Breadcrumbs } from '../shared/components/ui/Breadcrumbs'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-3 shrink-0">
          <Breadcrumbs />
        </header>
        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

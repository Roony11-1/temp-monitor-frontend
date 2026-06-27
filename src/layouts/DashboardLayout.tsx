import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

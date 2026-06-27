import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Empresas } from './pages/Empresas'
import { Sucursales } from './pages/Sucursales'
import { Usuarios } from './pages/Usuarios'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="sucursales" element={<Sucursales />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

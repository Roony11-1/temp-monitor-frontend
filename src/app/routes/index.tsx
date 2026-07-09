import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { Login } from '../../features/auth/pages/LoginPage'
import { Dashboard } from '../../features/dashboard/pages/DashboardPage'
import { Empresas } from '../../features/empresas/pages/EmpresasPage'
import { Sucursales } from '../../features/sucursales/pages/SucursalesPage'
import { Camaras } from '../../features/camaras/pages/CamarasPage'
import { RegistrarSensor } from '../../features/sensores/pages/RegistrarSensorPage'
import { Usuarios } from '../../features/usuarios/pages/UsuariosPage'
import { NotFound } from '../../features/not-found/pages/NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
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
          <Route path="camaras" element={<Camaras />} />
          <Route path="sensores/registrar" element={<RegistrarSensor />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

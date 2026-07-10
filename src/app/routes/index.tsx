import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { Login } from '../../features/auth/pages/LoginPage'
import { Dashboard } from '../../features/dashboard/pages/DashboardPage'
import { Empresas } from '../../features/empresas/pages/EmpresasPage'
import { EmpresaDetail } from '../../features/empresas/pages/EmpresaDetailPage'
import { Sucursales } from '../../features/sucursales/pages/SucursalesPage'
import { SucursalDetail } from '../../features/sucursales/pages/SucursalDetailPage'
import { Camaras } from '../../features/camaras/pages/CamarasPage'
import { CamaraDetail } from '../../features/camaras/pages/CamaraDetailPage'
import { RegistrarSensor } from '../../features/sensores/pages/RegistrarSensorPage'
import { Usuarios } from '../../features/usuarios/pages/UsuariosPage'
import { UsuarioDetail } from '../../features/usuarios/pages/UsuarioDetailPage'
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
          <Route path="empresas/:id" element={<EmpresaDetail />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="sucursales/:id" element={<SucursalDetail />} />
          <Route path="camaras" element={<Camaras />} />
          <Route path="camaras/:id" element={<CamaraDetail />} />
          <Route path="sensores/registrar" element={<RegistrarSensor />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/:id" element={<UsuarioDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

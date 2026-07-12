import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { Login } from '../../features/auth/pages/LoginPage'
import { Dashboard } from '../../features/dashboard/pages/DashboardPage'
import { Empresas } from '../../features/empresas/pages/EmpresasPage'
import { EmpresaDetail } from '../../features/empresas/pages/EmpresaDetailPage'
import { EmpresaEdit } from '../../features/empresas/pages/EmpresaEditPage'
import { Sucursales } from '../../features/sucursales/pages/SucursalesPage'
import { SucursalDetail } from '../../features/sucursales/pages/SucursalDetailPage'
import { SucursalEdit } from '../../features/sucursales/pages/SucursalEditPage'
import { Camaras } from '../../features/camaras/pages/CamarasPage'
import { CamaraDetail } from '../../features/camaras/pages/CamaraDetailPage'
import { CamaraEdit } from '../../features/camaras/pages/CamaraEditPage'
import { Sensores } from '../../features/sensores/pages/SensoresPage'
import { RegistrarSensor } from '../../features/sensores/pages/RegistrarSensorPage'
import { SimularLectura } from '../../features/sensores/pages/SimularLecturaPage'
import { Usuarios } from '../../features/usuarios/pages/UsuariosPage'
import { UsuarioDetail } from '../../features/usuarios/pages/UsuarioDetailPage'
import { UsuarioEdit } from '../../features/usuarios/pages/UsuarioEditPage'
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
          <Route path="empresas/:id/editar" element={<EmpresaEdit />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="sucursales/:id" element={<SucursalDetail />} />
          <Route path="sucursales/:id/editar" element={<SucursalEdit />} />
          <Route path="camaras" element={<Camaras />} />
          <Route path="camaras/:id" element={<CamaraDetail />} />
          <Route path="camaras/:id/editar" element={<CamaraEdit />} />
          <Route path="sensores" element={<Sensores />} />
          <Route path="sensores/registrar" element={<RegistrarSensor />} />
          <Route path="sensores/simular" element={<SimularLectura />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/:id" element={<UsuarioDetail />} />
          <Route path="usuarios/:id/editar" element={<UsuarioEdit />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

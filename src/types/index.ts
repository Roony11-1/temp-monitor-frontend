export type Rol = 'SUPER_ADMIN' | 'ADMIN_EMPRESA' | 'ADMIN_SUCURSAL' | 'TECNICO' | 'USUARIO'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
}

export interface Empresa {
  id: number
  nombre: string
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  createdAt: string
  updatedAt: string | null
}

export interface EmpresaRequest {
  nombre: string
  direccion: string
  telefono: string
  email: string
}

export interface Sucursal {
  id: number
  nombre: string
  direccion: string | null
  telefono: string | null
  empresaId: number
  activo: boolean
  createdAt: string
  updatedAt: string | null
}

export interface SucursalSummaryResponse {
  id: number
  nombre: string
  direccion: string | null
  telefono: string | null
  empresa: string
  empresaId: number
  activo: boolean
}

export interface SucursalRequest {
  nombre: string
  direccion: string
  telefono: string
  empresaId: number
}

export interface Usuario {
  id: number
  email: string
  nombre: string | null
  telefono: string | null
  roles: Rol[]
  empresa: string | null
  empresaId: number | null
  sucursal: string | null
  sucursalId: number | null
  activo: boolean
  createdAt: string
  lastLogin: string | null
}

export interface UsuarioRequest {
  email: string
  password: string
  nombre: string
  telefono: string
  empresaId: number | null
  sucursalId: number | null
  roles: Rol[]
}

export interface UsuarioSummaryResponse {
  id: number
  email: string
  nombre: string | null
  telefono: string | null
  empresa: string | null
  empresaId: number | null
  sucursal: string | null
  sucursalId: number | null
  roles: Rol[]
  activo: boolean
}

export interface Camara {
  id: number
  nombre: string
  descripcion: string | null
  sucursalId: number
  temperaturaMin: number | null
  temperaturaMax: number | null
  activo: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CamaraSummaryResponse
{
  id: number
  nombre: string
  descripcion: string | null
  sucursalId: number
  sucursal: string
  temperaturaMin: number | null
  temperaturaMax: number | null
  estado: boolean
}

export interface CamaraRequest {
  nombre: string
  descripcion: string
  sucursalId: number
  temperaturaMin: number | null
  temperaturaMax: number | null
}

export interface CamaraTemperatura {
  promedio: number | null
  sensoresConDatos: number
  ultimaLectura: string | null
}

export interface UltimaLecturaSensor {
  sensorUuid: string
  temperatura: number
  timestamp: string
}

export interface RegistroSensorRequest {
  macAddress: string
}

export interface RegistroSensorResponse {
  estado: string
  uuid: string
  apiKey: string
}

export interface AsignarSensorRequest {
  uuid: string
  apiKey: string
  camaraId: number
}

export interface Sensor {
  id: number
  uuid: string
  apiKeyHash: string
  macAddress: string
  camara: Camara | null
  sucursalId: number | null
  sucursalNombre: string | null
  empresaId: number | null
  empresaNombre: string | null
  ultimoContacto: string | null
  estado: string
  createdAt: string
  updatedAt: string | null
}

export interface SensorSummaryResponse {
  id: number
  uuid: string
  macAddress: string
  camaraId: number | null
  camaraNombre: string | null
  sucursalId: number | null
  sucursalNombre: string | null
  empresaId: number | null
  empresaNombre: string | null
  estado: string
}

export interface ActualizarSensorRequest {
  estado?: string
  camaraId?: number
}

export interface Lectura {
  id: number
  sensorUuid: string
  temperatura: number
  timestamp: string
}

export interface CamaraLectura {
  timestamp: string
  promedio: number
  sensores: number
}

export interface AuthUser {
  id: number
  email: string
  roles: Rol[]
  empresaId: number | null
  sucursalId: number | null
}

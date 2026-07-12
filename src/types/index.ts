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
  empresaId: number | null
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

export interface Camara {
  id: number
  nombre: string
  descripcion: string | null
  sucursalId: number
  activo: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CamaraRequest {
  nombre: string
  descripcion: string
  sucursalId: number
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

export interface ActualizarSensorRequest {
  estado?: string
  camaraId?: number
}

export interface AuthUser {
  id: number
  email: string
  roles: Rol[]
  empresaId: number | null
  sucursalId: number | null
}

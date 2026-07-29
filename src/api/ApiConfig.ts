export const ApiConfig = {
  auth: {
    login: '/auth/login',
  },
  empresas: {
    list: '/api/empresas',
    byId: (id: number) => `/api/empresas/${id}`,
    activar: (id: number) => `/api/empresas/${id}/activar`,
    desactivar: (id: number) => `/api/empresas/${id}/desactivar`,
  },
  sucursales: {
    list: '/api/sucursales',
    byId: (id: number) => `/api/sucursales/${id}`,
    byEmpresa: (empresaId: number) => `/api/sucursales/empresa/${empresaId}`,
    activar: (id: number) => `/api/sucursales/${id}/activar`,
    desactivar: (id: number) => `/api/sucursales/${id}/desactivar`,
  },
  camaras: {
    list: '/api/camaras',
    byId: (id: number) => `/api/camaras/${id}`,
    bySucursal: (sucursalId: number) => `/api/camaras/sucursal/${sucursalId}`,
    activar: (id: number) => `/api/camaras/${id}/activar`,
    desactivar: (id: number) => `/api/camaras/${id}/desactivar`,
  },
  sensores: {
    list: '/api/sensores',
    registrar: '/api/sensores/registrar',
    asignar: '/api/sensores/asignar',
    byCamara: (camaraId: number) => `/api/sensores/camara/${camaraId}`,
    byUuid: (uuid: string) => `/api/sensores/${uuid}`,
    estado: (uuid: string) => `/api/sensores/${uuid}/estado`,
    renewApiKey: (uuid: string) => `/api/sensores/${uuid}/renew-api-key`,
  },
  lecturas: {
    porSensor: (uuid: string) => `/api/lecturas/sensor/${uuid}`,
  },
  usuarios: {
    list: '/api/usuarios',
    byId: (id: number) => `/api/usuarios/${id}`,
    byEmpresa: (empresaId: number) => `/api/usuarios/empresa/${empresaId}`,
    bySucursal: (sucursalId: number) => `/api/usuarios/sucursal/${sucursalId}`,
    password: (id: number) => `/api/usuarios/${id}/password`,
    activar: (id: number) => `/api/usuarios/${id}/activar`,
    desactivar: (id: number) => `/api/usuarios/${id}/desactivar`,
  },
}

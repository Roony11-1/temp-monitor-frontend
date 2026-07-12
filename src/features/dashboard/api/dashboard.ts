import { api } from '../../../api/axios'

export interface DashboardMetrics {
  empresas: number
  sucursales: number
  camarasActivas: number
  sensoresOnline: number
  sensoresOffline: number
  alertasCriticas: number
  temperaturaPromedio: number
}

export interface TemperaturePoint {
  hora: string
  temperatura: number
}

export interface DashboardEvent {
  id: number | string
  tipo: 'critico' | 'advertencia' | 'info' | 'normal'
  mensaje: string
  timestamp: string
  origen: string
}

export interface DashboardData {
  metrics: DashboardMetrics
  temperatura24h: TemperaturePoint[]
  eventos: DashboardEvent[]
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { data } = await api.get('/api/dashboard')

  return {
    metrics: {
      empresas: data.empresas,
      sucursales: data.sucursales,
      camarasActivas: data.camarasActivas,
      sensoresOnline: data.sensoresOnline,
      sensoresOffline: data.sensoresOffline,
      alertasCriticas: 0,
      temperaturaPromedio: data.temperaturaPromedio,
    },
    temperatura24h: data.temperatura24h ?? [],
    eventos: [],
  }
}

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

function generateMockTemperature(): TemperaturePoint[] {
  const points: TemperaturePoint[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = date.getHours().toString().padStart(2, '0')
    const baseTemp = 20 + Math.sin((i / 24) * Math.PI * 2) * 3
    const noise = (Math.random() - 0.5) * 2
    points.push({
      hora: `${hour}:00`,
      temperatura: Math.round((baseTemp + noise) * 10) / 10,
    })
  }
  return points
}

function generateMockEvents(): DashboardEvent[] {
  const tipos: DashboardEvent['tipo'][] = ['critico', 'advertencia', 'info', 'normal']
  const mensajes = [
    'Temperatura crítica en Cámara 7',
    'Temperatura alta en Cámara 3',
    'Sensor S-012 reconectado',
    'Temperatura normal en Cámara 5',
    'Alerta de batería baja en S-031',
    'Sensor S-042 sin conexión',
    'Lectura fuera de rango en Cámara 2',
  ]
  const origenes = ['Cámara 7', 'Cámara 3', 'Cámara 1', 'Cámara 5', 'S-031', 'S-042', 'Cámara 2']
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const idx = Math.floor(Math.random() * mensajes.length)
    const date = new Date(now.getTime() - i * 25 * 60 * 1000)
    return {
      id: i + 1,
      tipo: tipos[i % tipos.length],
      mensaje: mensajes[idx],
      timestamp: date.toISOString(),
      origen: origenes[idx],
    }
  })
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [empresasRes, sucursalesRes, camarasRes] = await Promise.all([
    api.get('/api/empresas').catch(() => ({ data: [] })),
    api.get('/api/sucursales').catch(() => ({ data: [] })),
    api.get('/api/camaras').catch(() => ({ data: [] })),
  ])

  const empresas = Array.isArray(empresasRes.data) ? empresasRes.data : []
  const sucursales = Array.isArray(sucursalesRes.data) ? sucursalesRes.data : []
  const camaras = Array.isArray(camarasRes.data) ? camarasRes.data : []

  return {
    metrics: {
      empresas: empresas.length,
      sucursales: sucursales.length,
      camarasActivas: camaras.filter((c: any) => c.activo).length,
      sensoresOnline: Math.floor(Math.random() * 50) + 100,
      sensoresOffline: Math.floor(Math.random() * 10) + 5,
      alertasCriticas: Math.floor(Math.random() * 5) + 1,
      temperaturaPromedio: Math.round((20 + Math.random() * 5) * 10) / 10,
    },
    temperatura24h: generateMockTemperature(),
    eventos: generateMockEvents(),
  }
}

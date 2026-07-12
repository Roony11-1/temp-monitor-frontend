import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { getLecturasSensor, getSensores } from '../../../api/sensores'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Sensor, Lectura } from '../../../types'
import styles from './RegistrarSensorPage.module.css'

interface ChartPoint {
  hora: string
  temperatura: number
}

export function SensorLecturas() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [sensor, setSensor] = useState<Sensor | null>(null)
  const [lecturas, setLecturas] = useState<Lectura[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uuid) return
    setLoading(true)
    Promise.all([
      getSensores(),
      getLecturasSensor(uuid),
    ])
      .then(([sensores, lecs]) => {
        const s = sensores.find((x) => x.uuid === uuid)
        if (!s) { navigate('/sensores'); return }
        setSensor(s)
        setLecturas(lecs)
      })
      .catch(() => navigate('/sensores'))
      .finally(() => setLoading(false))
  }, [uuid])

  if (loading) {
    return (
      <div className={styles.page}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="200px" /></Card>
      </div>
    )
  }

  if (!sensor) return null

  const chartData: ChartPoint[] = [...lecturas]
    .reverse()
    .map((l) => ({
      hora: new Date(l.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      temperatura: l.temperatura,
    }))

  return (
    <div className={styles.page}>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/sensores')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Volver
        </button>
        <div>
          <h1 className={styles.title}>Lecturas del Sensor</h1>
          <p className={styles.subtitle}>
            {sensor.macAddress} — {sensor.camara?.nombre ?? 'Sin cámara'}
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>UUID</span>
          <span className={styles.mono}>{sensor.uuid}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Estado</span>
          <span>{sensor.estado}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Total lecturas</span>
          <span>{lecturas.length}</span>
        </div>
      </div>

      {lecturas.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Temperatura
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip />
                <Area type="monotone" dataKey="temperatura" stroke="#6366f1" strokeWidth={2} fill="url(#tempGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Historial de lecturas
        </h3>
        {lecturas.length === 0 ? (
          <p className="text-sm text-gray-400">No hay lecturas registradas</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">#</th>
                  <th className="pb-2 pr-4 font-medium">Temperatura</th>
                  <th className="pb-2 font-medium">Fecha / Hora</th>
                </tr>
              </thead>
              <tbody>
                {[...lecturas].reverse().map((l, i) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-400">{lecturas.length - i}</td>
                    <td className="py-2 pr-4 font-mono">{l.temperatura}°C</td>
                    <td className="py-2 text-gray-500">
                      {new Date(l.timestamp).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

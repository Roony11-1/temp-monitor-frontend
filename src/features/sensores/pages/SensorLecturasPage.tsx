import { useState } from 'react'
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
import { useSensores, useLecturasSensor, useLecturasSensorPage } from '../hooks/useSensores'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { DataTable } from '../../../components/DataTable'
import { timeAgo } from '../../../shared/utils/timeAgo'
import type { ColumnDef } from '../../../types/table'
import type { Lectura } from '../../../types'
import styles from './RegistrarSensorPage.module.css'

interface ChartPoint {
  hora: string
  temperatura: number
}

export function SensorLecturas() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [chartRange, setChartRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [since, setSince] = useState<number | undefined>(() => Date.now() - 604800000)

  const { data: sensores = [], isLoading: loadingSens } = useSensores()
  const { data: allLecturas = [], isLoading: loadingAllLect } = useLecturasSensor(uuid ?? '', since)
  const { data: pageData, isLoading: loadingPage } = useLecturasSensorPage(uuid ?? '', page, pageSize, since)

  const loading = loadingSens || loadingAllLect || loadingPage
  const sensor = sensores.find((x) => x.uuid === uuid)
  const lecturas = pageData?.content ?? []

  if (!loading && !sensor) {
    navigate('/sensores')
    return null
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="200px" /></Card>
      </div>
    )
  }

  const fmtHora = (ts: string) =>
    new Date(ts).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const chartData: ChartPoint[] = [...allLecturas]
    .reverse()
    .map((l) => ({
      hora: fmtHora(l.timestamp),
      temperatura: l.temperatura,
    }))

  const columns: ColumnDef<Lectura>[] = [
    {
      key: 'timestamp',
      label: 'Fecha / Hora',
      sortable: true,
      render: (v) => {
        const d = new Date(v)
        return (
          <span className="text-gray-500">
            {d.toLocaleString('es-CL')} <span className="text-gray-400">({timeAgo(v)})</span>
          </span>
        )
      },
    },
    {
      key: 'temperatura',
      label: 'Temperatura',
      sortable: true,
      render: (v) => <span className="font-mono">{v}°C</span>,
    },
  ]

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
            {sensor!.macAddress} — {sensor!.camara?.nombre ?? 'Sin cámara'}
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>UUID</span>
          <span className={styles.mono}>{sensor!.uuid}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Estado</span>
          <span>{sensor!.estado}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Total lecturas</span>
          <span>{pageData?.total ?? allLecturas.length}</span>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Temperatura
          </h3>
          <div className="flex gap-1">
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setChartRange(r)
                  setSince(r === 'all' ? undefined : Date.now() - (r === '24h' ? 86400000 : r === '7d' ? 604800000 : 2592000000))
                }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  chartRange === r
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {r === 'all' ? 'Todo' : r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
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
                <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={Math.max(1, Math.floor(chartData.length / 12))} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip labelFormatter={(label) => `${label}`} formatter={(value) => [`${value}°C`, 'Temperatura']} />
                <Area type="monotone" dataKey="temperatura" stroke="#6366f1" strokeWidth={2} fill="url(#tempGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-8 text-center">No hay lecturas en este rango</div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Historial de lecturas
        </h3>
        <DataTable
          data={lecturas}
          columns={columns}
          loading={loading}
          rowKey={(l) => l.id}
          pagination={pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          emptyMessage="No hay lecturas registradas"
        />
      </Card>
    </div>
  )
}

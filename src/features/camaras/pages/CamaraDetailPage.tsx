import { useState, useEffect, useRef } from 'react'
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
import { useCamara, useUltimasLecturas, useCamaraLecturas } from '../hooks/useCamaras'
import { useSensoresByCamara } from '../../sensores/hooks/useSensores'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { timeAgo } from '../../../shared/utils/timeAgo'
import styles from './CamaraDetailPage.module.css'

const CADENCIA_MUESTRA_MS = 165_000

export function CamaraDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const camaraId = Number(id)
  const { data: camara, isLoading, isError } = useCamara(camaraId)
  const { data: ultimasLecturas = [] } = useUltimasLecturas(camaraId)
  const { data: sensores = [] } = useSensoresByCamara(camaraId)
  const [chartRange, setChartRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [since, setSince] = useState<number | undefined>(() => Date.now() - 604800000)
  const { data: lecturas = [] } = useCamaraLecturas(camaraId, since)
  const [ahora, setAhora] = useState(() => Date.now())
  const [siguienteAt, setSiguienteAt] = useState<number | null>(null)
  const ultimaMuestreadoRef = useRef<string | null>(null)

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (lecturas.length === 0) return
    const ultima = lecturas[lecturas.length - 1]
    if (ultimaMuestreadoRef.current === ultima.muestreadoEn) return
    ultimaMuestreadoRef.current = ultima.muestreadoEn
    setSiguienteAt(new Date(ultima.muestreadoEn).getTime() + CADENCIA_MUESTRA_MS)
  }, [lecturas])

  const ultimaMuestra = lecturas.length > 0 ? lecturas[lecturas.length - 1] : null
  const faltaSeg = siguienteAt ? Math.max(0, Math.ceil((siguienteAt - ahora) / 1000)) : null
  const mm = faltaSeg != null ? Math.floor(faltaSeg / 60) : null
  const ss = faltaSeg != null ? faltaSeg % 60 : null
  const esperandoSiguiente = siguienteAt == null || (siguienteAt - ahora) <= 0

  const ultimaMedidaPorSensor = new Map(ultimasLecturas.map((l) => [l.sensorUuid, l]))

  const fmtHora = (ts: string) =>
    new Date(ts).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const chartData = lecturas.map((l) => ({
    hora: fmtHora(l.timestamp),
    temperatura: Math.round(l.promedio * 10) / 10,
  }))

  if (isLoading) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/camaras')} className={styles.backBtn}>
              &larr;
            </button>
            <div>
              <h1 className={styles.pageTitle}>Cámara no encontrada</h1>
              <p className={styles.pageSubtitle}>No se pudo cargar la cámara o no tiene acceso a ella.</p>
            </div>
          </div>
        </div>
        <Card>
          <p className="py-8 text-center text-sm text-gray-500">La cámara no existe o no está disponible en tu ámbito de acceso.</p>
        </Card>
      </div>
    )
  }

  if (!camara) return null

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return <Badge variant="success">Activo</Badge>
      case 'DESHABILITADO': return <Badge variant="danger">Deshabilitado</Badge>
      default: return <Badge variant="warning">Pendiente</Badge>
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/camaras')}
            className={styles.backBtn}
          >
            &larr;
          </button>
          <div>
            <h1 className={styles.pageTitle}>{camara.nombre}</h1>
            <p className={styles.pageSubtitle}>Detalle de cámara</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/camaras/${id}/editar`)}
          className={styles.editBtn}
        >
          Editar
        </button>
      </div>

      <Card>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Temperatura medida (°C)</p>
            <p className={styles.tempValue}>
              {ultimaMuestra
                ? `${Math.round(ultimaMuestra.promedio * 10) / 10}°`
                : 'Tomando lecturas'}
            </p>
            {ultimaMuestra && (
              <p className={styles.tempMeta}>
                promedio de {ultimaMuestra.sensores}{' '}
                {ultimaMuestra.sensores === 1 ? 'sensor' : 'sensores'}
              </p>
            )}
            <p className={styles.tempMeta}>
              {esperandoSiguiente ? (
                <>
                  <span className={styles.spinner} />
                  Tomando lecturas…
                </>
              ) : (
                `Próxima muestra en ${mm}:${String(ss).padStart(2, '0')}`
              )}
            </p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Descripción</p>
            <p className={styles.fieldValue}>{camara.descripcion || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Rango temp. (°C)</p>
            <p className={styles.fieldValue}>
              {camara.temperaturaMin != null && camara.temperaturaMax != null
                ? `[${camara.temperaturaMin}, ${camara.temperaturaMax}]`
                : camara.temperaturaMin != null || camara.temperaturaMax != null
                  ? (camara.temperaturaMin ?? camara.temperaturaMax)
                  : 'No asignado'}
            </p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Estado</p>
            <div className={styles.badgeWrapper}>
              <Badge variant={camara.activo ? 'success' : 'danger'}>
                {camara.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Temperatura (promedio)</h3>
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
                  <linearGradient id="camTempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={50} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}°C`, 'Promedio']} />
                <Area type="monotone" dataKey="temperatura" stroke="#6366f1" strokeWidth={2} fill="url(#camTempGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-8 text-center">No hay muestras en este rango</div>
        )}
      </Card>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Sensores Asociados</h2>
        <span className={styles.sectionCount}>{sensores.length}</span>
      </div>

      {sensores.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>No hay sensores asociados a esta cámara</p>
        </Card>
      ) : (
        <Card padding="none">
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>MAC Address</th>
                <th className={styles.tableHeader}>UUID</th>
                <th className={styles.tableHeader}>Última medida</th>
                <th className={styles.tableHeader}>Estado</th>
                <th className={styles.tableHeader}>Último Contacto</th>
              </tr>
            </thead>
            <tbody>
              {sensores.map((s) => {
                const ultima = ultimaMedidaPorSensor.get(s.uuid)
                return (
                  <tr key={s.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span
                        className="cursor-pointer hover:text-indigo-600 font-mono text-xs"
                        onClick={() => navigate(`/sensores/${s.uuid}/lecturas`)}
                      >
                        {s.macAddress}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        className="cursor-pointer hover:text-indigo-600 font-mono text-xs"
                        onClick={() => navigate(`/sensores/${s.uuid}/lecturas`)}
                      >
                        {s.uuid}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {ultima
                        ? <span className={styles.mono}>{ultima.temperatura}°C</span>
                        : '-'}
                    </td>
                    <td className={styles.tableCell}>{estadoBadge(s.estado)}</td>
                    <td className={styles.tableCell}>
                      {s.ultimoContacto
                        ? <span className={styles.cellMuted}>{timeAgo(s.ultimoContacto)}</span>
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

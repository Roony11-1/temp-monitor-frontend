import { useDashboard } from '../hooks/useDashboard'
import { MetricCard } from '../../../shared/components/ui/MetricCard'
import { TemperatureChart } from '../components/TemperatureChart'
import { SensorDonutChart } from '../components/SensorDonutChart'
import { RecentEventsCard } from '../components/RecentEventsCard'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'

const iconBuilding = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none stroke-2">
    <rect x="4" y="2" width="12" height="16" rx="1" />
    <line x1="7" y1="6" x2="9" y2="6" />
    <line x1="11" y1="6" x2="13" y2="6" />
  </svg>
)

const iconLocation = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none stroke-2">
    <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" />
    <circle cx="10" cy="8" r="2.5" />
  </svg>
)

const iconCamera = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none stroke-2">
    <rect x="2" y="5" width="16" height="11" rx="2" />
    <circle cx="10" cy="10.5" r="3" />
    <path d="M7 5l1.5-2h3L13 5" />
  </svg>
)

const iconSignal = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none stroke-2">
    <path d="M5 10a5 5 0 0110 0" />
    <path d="M3 7a8 8 0 0114 0" />
    <path d="M7 13a2 2 0 016 0" />
  </svg>
)

const iconAlert = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="stroke-current fill-none stroke-2">
    <path d="M10 2l8 16H2l8-16z" />
    <line x1="10" y1="8" x2="10" y2="12" />
    <circle cx="10" cy="14" r="0.5" fill="currentColor" />
  </svg>
)

export function Dashboard() {
  const { data, loading } = useDashboard()
  const metrics = data?.metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del sistema de monitoreo</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Empresas"
          value={metrics?.empresas ?? '-'}
          icon={iconBuilding}
          loading={loading}
        />
        <MetricCard
          title="Sucursales"
          value={metrics?.sucursales ?? '-'}
          icon={iconLocation}
          loading={loading}
        />
        <MetricCard
          title="Cámaras activas"
          value={metrics?.camarasActivas ?? '-'}
          icon={iconCamera}
          variant="success"
          loading={loading}
        />
        <MetricCard
          title="Sensores online"
          value={metrics?.sensoresOnline ?? '-'}
          icon={iconSignal}
          variant="success"
          loading={loading}
        />
        <MetricCard
          title="Sensores offline"
          value={metrics?.sensoresOffline ?? '-'}
          icon={iconSignal}
          variant="danger"
          loading={loading}
        />
        <MetricCard
          title="Alertas críticas"
          value={metrics?.alertasCriticas ?? '-'}
          icon={iconAlert}
          variant="danger"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <LoadingSkeleton width="180px" height="16px" className="mb-4" />
              <LoadingSkeleton width="100%" height="240px" />
            </div>
          ) : (
            <TemperatureChart data={data?.temperatura24h ?? []} />
          )}
        </div>
        <div>
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <LoadingSkeleton width="140px" height="16px" className="mb-1" />
              <LoadingSkeleton width="100px" height="12px" className="mb-3" />
              <LoadingSkeleton width="100%" height="180px" className="mb-3" />
              <LoadingSkeleton width="100%" height="1px" className="mb-2" />
              <LoadingSkeleton width="160px" height="16px" />
            </div>
          ) : (
            <SensorDonutChart
              online={metrics?.sensoresOnline ?? 0}
              offline={metrics?.sensoresOffline ?? 0}
              promedio={metrics?.temperaturaPromedio ?? 0}
            />
          )}
        </div>
      </div>

      {/* Recent events */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <LoadingSkeleton width="120px" height="16px" className="mb-3" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
              <LoadingSkeleton width="8px" height="8px" rounded="full" className="mt-1.5" />
              <div className="flex-1">
                <LoadingSkeleton width="70%" height="14px" className="mb-1" />
                <LoadingSkeleton width="40%" height="12px" />
              </div>
              <LoadingSkeleton width="60px" height="18px" />
            </div>
          ))}
        </div>
      ) : (
        <RecentEventsCard events={data?.eventos ?? []} />
      )}
    </div>
  )
}

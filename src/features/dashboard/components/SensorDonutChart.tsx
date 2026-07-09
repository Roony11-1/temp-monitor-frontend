import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface SensorDonutChartProps {
  online: number
  offline: number
  promedio: number
}

const COLORS = ['#22c55e', '#ef4444']

export function SensorDonutChart({
  online,
  offline,
  promedio,
}: SensorDonutChartProps) {
  const data = [
    { name: 'Online', value: online },
    { name: 'Offline', value: offline },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Estado de sensores
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        {online} online · {offline} offline
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: '12px', color: '#64748b' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Temperatura promedio</span>
          <span className="font-semibold text-gray-900">{promedio}°C</span>
        </div>
      </div>
    </div>
  )
}

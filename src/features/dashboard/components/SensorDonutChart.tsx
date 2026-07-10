import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import styles from './SensorDonutChart.module.css'

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
    <div className={styles.card}>
      <h3 className={styles.title}>
        Estado de sensores
      </h3>
      <p className={styles.subtitle}>
        {online} online · {offline} offline
      </p>
      <div className={styles.chart}>
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
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <span className={styles.footerLabel}>Temperatura promedio</span>
          <span className={styles.footerValue}>{promedio}°C</span>
        </div>
      </div>
    </div>
  )
}

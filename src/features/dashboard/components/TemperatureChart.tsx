import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { TemperaturePoint } from '../api/dashboard'
import styles from './TemperatureChart.module.css'

interface TemperatureChartProps {
  data: TemperaturePoint[]
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  const hasData = data !== null && data.length > 0

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Temperatura últimas 24 horas
      </h3>
      <div className={styles.chart}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="hora"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
                labelStyle={{ fontWeight: 600, color: '#1e293b' }}
              />
              <Area
                type="monotone"
                dataKey="temperatura"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#tempGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#94a3b8',
            fontSize: '14px',
          }}>
            Sin datos de temperatura
          </div>
        )}
      </div>
    </div>
  )
}

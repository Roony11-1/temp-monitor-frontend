import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { LoadingSkeleton } from './LoadingSkeleton'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; direction: 'up' | 'down' }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
  className?: string
}

const variantDot = {
  default: 'bg-gray-400',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  loading = false,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('size-2 rounded-full shrink-0', variantDot[variant])} />
            <p className="text-sm text-gray-500 truncate">{title}</p>
          </div>
          {loading ? (
            <LoadingSkeleton width="80px" height="28px" className="mt-0.5" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          )}
          {subtitle && !loading && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && !loading && (
          <div className="size-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 ml-3">
            {icon}
          </div>
        )}
      </div>
      {trend && !loading && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.direction === 'up'
                ? 'text-green-600'
                : trend.direction === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500',
            )}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
          </span>
        </div>
      )}
    </div>
  )
}

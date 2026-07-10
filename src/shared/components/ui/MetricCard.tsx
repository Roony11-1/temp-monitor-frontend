import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { LoadingSkeleton } from './LoadingSkeleton'
import styles from './MetricCard.module.css'

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
  default: styles.dotDefault,
  success: styles.dotSuccess,
  warning: styles.dotWarning,
  danger: styles.dotDanger,
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
    <div className={cn(styles.card, className)}>
      <div className={styles.header}>
        <div className={styles.content}>
          <div className={styles.titleRow}>
            <span className={cn(styles.dot, variantDot[variant])} />
            <p className={styles.title}>{title}</p>
          </div>
          {loading ? (
            <LoadingSkeleton width="80px" height="28px" className="mt-0.5" />
          ) : (
            <p className={styles.value}>{value}</p>
          )}
          {subtitle && !loading && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </div>
        {icon && !loading && (
          <div className={styles.iconWrapper}>{icon}</div>
        )}
      </div>
      {trend && !loading && (
        <div className={styles.trend}>
          <span
            className={cn(
              trend.direction === 'up'
                ? styles.trendUp
                : trend.direction === 'down'
                  ? styles.trendDown
                  : styles.trendNeutral,
            )}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
          </span>
        </div>
      )}
    </div>
  )
}

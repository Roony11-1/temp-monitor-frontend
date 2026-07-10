import type { BadgeVariant, BadgeSize, BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'
import styles from './Badge.module.css'

const variantStyles: Record<BadgeVariant, string> = {
  success: styles.success,
  danger: styles.danger,
  warning: styles.warning,
  info: styles.info,
  neutral: styles.neutral,
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: styles.sm,
  md: styles.md,
}

interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant
  size?: BadgeSize
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

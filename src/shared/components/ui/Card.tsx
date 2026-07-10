import type { BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'
import styles from './Card.module.css'

interface CardProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  none: styles.p0,
  sm: styles.p4,
  md: styles.p6,
  lg: styles.p8,
}

export function Card({
  padding = 'md',
  hover = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        paddingStyles[padding],
        hover && styles.hover,
        className,
      )}
    >
      {children}
    </div>
  )
}

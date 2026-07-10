import { cn } from '../../utils/cn'
import styles from './LoadingSkeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const roundedStyles = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  full: styles.full,
}

export function LoadingSkeleton({
  width,
  height,
  rounded = 'md',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, roundedStyles[rounded], className)}
      style={{ width, height }}
    />
  )
}

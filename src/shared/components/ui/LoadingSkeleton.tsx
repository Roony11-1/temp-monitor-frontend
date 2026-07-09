import { cn } from '../../utils/cn'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

const roundedStyles = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function LoadingSkeleton({
  width,
  height,
  rounded = 'md',
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        roundedStyles[rounded],
        className,
      )}
      style={{ width, height }}
    />
  )
}

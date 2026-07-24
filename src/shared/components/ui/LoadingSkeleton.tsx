import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  count?: number
  circle?: boolean
  borderRadius?: string | number
  className?: string
  containerClassName?: string
  baseColor?: string
  highlightColor?: string
  inline?: boolean
  duration?: number
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedMap = {
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  full: '9999px',
}

export function LoadingSkeleton({
  width,
  height,
  count = 1,
  circle,
  borderRadius,
  className,
  containerClassName,
  baseColor = '#e5e7eb',
  highlightColor = '#f3f4f6',
  inline,
  duration = 1.5,
  rounded,
}: SkeletonProps) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton
        width={width}
        height={height}
        count={count}
        circle={circle}
        borderRadius={borderRadius ?? (rounded ? roundedMap[rounded] : undefined)}
        className={className}
        containerClassName={containerClassName}
        inline={inline}
        duration={duration}
      />
    </SkeletonTheme>
  )
}

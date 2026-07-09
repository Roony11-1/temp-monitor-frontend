import type { BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'

interface CardProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
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
        'bg-white rounded-xl shadow-sm border border-gray-200',
        paddingStyles[padding],
        hover && 'hover:shadow-md transition-shadow',
        className,
      )}
    >
      {children}
    </div>
  )
}

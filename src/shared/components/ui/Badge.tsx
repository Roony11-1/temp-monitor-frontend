import type { BadgeVariant, BadgeSize, BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
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
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

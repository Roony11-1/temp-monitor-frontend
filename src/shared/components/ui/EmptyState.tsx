import type { BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'

interface EmptyStateProps extends BaseComponentProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

function EmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="stroke-current fill-none stroke-1 text-gray-300"
    >
      <rect x="6" y="10" width="36" height="28" rx="3" />
      <line x1="16" y1="20" x2="32" y2="20" />
      <line x1="16" y1="26" x2="28" y2="26" />
      <line x1="16" y1="32" x2="24" y2="32" />
    </svg>
  )
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6',
        className,
      )}
    >
      <EmptyIcon />
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 text-center max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

import type { BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'
import styles from './EmptyState.module.css'

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
    <svg width="48" height="48" viewBox="0 0 48 48" className={styles.icon}>
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
    <div className={cn(styles.container, className)}>
      <EmptyIcon />
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <button onClick={action.onClick} className={styles.action}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

export type BadgeSize = 'sm' | 'md'

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

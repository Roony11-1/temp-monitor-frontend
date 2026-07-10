import type { BaseComponentProps } from '../../types/common'
import { cn } from '../../utils/cn'
import styles from './PageHeader.module.css'

interface PageHeaderProps extends BaseComponentProps {
  title: string
  description?: string
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn(styles.header, className)}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  )
}

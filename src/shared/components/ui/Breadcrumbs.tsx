import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs, type BreadcrumbItem } from '../../utils/breadcrumbs'
import styles from './Breadcrumbs.module.css'

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" className={styles.chevron}>
      <polyline points="8 5 13 10 8 15" />
    </svg>
  )
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { pathname } = useLocation()
  const crumbs = items ?? getBreadcrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => (
          <li key={index} className={styles.item}>
            {index > 0 && <ChevronRight />}
            {crumb.href ? (
              <Link to={crumb.href} className={styles.link}>
                {crumb.label}
              </Link>
            ) : (
              <span className={styles.active}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

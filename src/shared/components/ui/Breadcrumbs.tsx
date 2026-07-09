import { Link, useLocation } from 'react-router-dom'
import { getBreadcrumbs, type BreadcrumbItem } from '../../utils/breadcrumbs'
import { cn } from '../../utils/cn'

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

function ChevronRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      className="stroke-current fill-none stroke-2 text-gray-400 shrink-0"
    >
      <polyline points="8 5 13 10 8 15" />
    </svg>
  )
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { pathname } = useLocation()
  const crumbs = items ?? getBreadcrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight />}
            {crumb.href ? (
              <Link
                to={crumb.href}
                className={cn(
                  'text-gray-500 hover:text-gray-700 transition-colors',
                  'hover:underline underline-offset-2',
                )}
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

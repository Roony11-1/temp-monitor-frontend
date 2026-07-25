import { useState, useMemo } from 'react'
import type { ColumnDef, SortState, FilterValues, PaginationState } from '../types/table'
import { applyFilters, applySorting } from '../utils/tableFilters'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { SkeletonTable } from '../shared/components/ui/SkeletonTable'
import { cn } from '../shared/utils/cn'
import styles from './DataTable.module.css'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  actions?: (row: T) => React.ReactNode
  pagination?: PaginationState
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

const pageSizeOptions = [10, 20, 50, 100]

function getPageNumbers(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'dots')[] = [1]

  if (current > 3) {
    pages.push('dots')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('dots')
  }

  pages.push(total)

  return pages
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyMessage = 'No hay registros',
  emptyDescription,
  emptyAction,
  rowKey,
  onRowClick,
  actions,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const visibleColumns = columns.filter((c) => c.filterable || c.sortable || c.key)

  const processed = useMemo(() => {
    const filtered = applyFilters(data, columns, filters)
    return applySorting(filtered, columns, sort)
  }, [data, columns, filters, sort])

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const hasAnyFilters = columns.some((c) => c.filterable)

  return (
    <div>
      {hasAnyFilters && (
        <div className={styles.filterBar}>
          <div className={styles.filterGrid}>
            {columns
              .filter((c) => c.filterable)
              .map((col) => (
                <div key={col.key}>
                  <label className={styles.filterLabel}>{col.label}</label>
                  {col.filterType === 'boolean' ? (
                    <select
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className={styles.filterInput}
                    >
                      <option value="">{col.label} (todos)</option>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  ) : col.filterType === 'select' && col.filterOptions ? (
                    <select
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className={styles.filterInput}
                    >
                      <option value="">{col.label} (todos)</option>
                      {col.filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : col.filterType === 'number' ? (
                    <input
                      type="text"
                      placeholder={`${col.label} (ej: >25)`}
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className={styles.filterInput}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={`Filtrar ${col.label.toLowerCase()}...`}
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className={styles.filterInput}
                    />
                  )}
                </div>
              ))}
            {Object.values(filters).some((v) => v !== '' && v != null) && (
              <button
                onClick={() => setFilters({})}
                className={styles.clearBtn}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.tableWrapper}>
          <SkeletonTable
            columns={visibleColumns.length}
            rows={5}
            actions={!!actions}
          />
        </div>
      ) : processed.length > 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        styles.headerCell,
                        col.sortable && styles.headerCellSortable,
                        col.key === 'acciones' ? styles.headerCellRight : styles.headerCellLeft,
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className={styles.sortLabel}>
                        {col.label}
                        {sort?.key === col.key && (
                          <span className={styles.sortIcon}>
                            {sort.direction === 'asc' ? '\u25B2' : '\u25BC'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {actions && <th className={cn(styles.headerCell, styles.headerCellRight)}>Acciones</th>}
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {processed.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className={cn(styles.tableRow, onRowClick && styles.tableRowClickable)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleColumns.map((col) => {
                      const raw = (row as any)[col.key]
                      return (
                        <td key={col.key} className={styles.tableCell}>
                          {col.render ? col.render(raw, row) : String(raw ?? '-')}
                        </td>
                      )
                    })}
                    {actions && (
                      <td className={styles.actionsCell}>{actions(row)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles.emptyWrapper}>
          <EmptyState
            title={emptyMessage}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      )}

      {pagination && !loading && pagination.total > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
          </span>

          <div className={styles.paginationControls}>
            <div className={styles.pageSizeSelector}>
              <span className={styles.pageSizeLabel}>Filas:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className={styles.pageSizeSelect}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <nav className={styles.pageNav} aria-label="Paginación">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={cn(
                  styles.pageBtn,
                  pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtnInactive,
                )}
                aria-label="Página anterior"
              >
                ‹
              </button>

              {getPageNumbers(pagination.page, Math.ceil(pagination.total / pagination.pageSize)).map((p, i) =>
                p === 'dots' ? (
                  <span key={`dots-${i}`} className={styles.dots}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded transition-colors',
                      p === pagination.page
                        ? styles.pageBtnActive
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                    aria-label={`Ir a página ${p}`}
                    aria-current={p === pagination.page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className={cn(
                  styles.pageBtn,
                  pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
                    ? styles.pageBtnDisabled
                    : styles.pageBtnInactive,
                )}
                aria-label="Página siguiente"
              >
                ›
              </button>
            </nav>
          </div>
        </div>
      )}

      {!pagination && !loading && processed.length > 0 && (
        <div className={styles.recordCount}>
          {processed.length} de {data.length} registros
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import type { ColumnDef, SortState, FilterValues, PaginationState } from '../types/table'
import { applyFilters, applySorting } from '../utils/tableFilters'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { SkeletonTable } from '../shared/components/ui/SkeletonTable'
import { cn } from '../shared/utils/cn'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  rowKey: (row: T) => string | number
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
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {columns
              .filter((c) => c.filterable)
              .map((col) => (
                <div key={col.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {col.label}
                  </label>
                  {col.filterType === 'boolean' ? (
                    <select
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Todos</option>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  ) : col.filterType === 'select' && col.filterOptions ? (
                    <select
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="">Todos</option>
                      {col.filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : col.filterType === 'number' ? (
                    <input
                      type="text"
                      placeholder="ej: >25, <10, =5"
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Filtrar..."
                      value={filters[col.key] ?? ''}
                      onChange={(e) => updateFilter(col.key, e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <SkeletonTable
            columns={visibleColumns.length}
            rows={5}
            actions={!!actions}
          />
        </div>
      ) : processed.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-6 py-3 font-medium ${
                        col.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                      } ${col.key === 'acciones' ? 'text-right' : 'text-left'}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sort?.key === col.key && (
                          <span className="text-indigo-600">
                            {sort.direction === 'asc' ? '\u25B2' : '\u25BC'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {actions && <th className="text-right px-6 py-3 font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {processed.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-gray-50">
                    {visibleColumns.map((col) => {
                      const raw = (row as any)[col.key]
                      return (
                        <td key={col.key} className="px-6 py-4">
                          {col.render ? col.render(raw, row) : String(raw ?? '-')}
                        </td>
                      )
                    })}
                    {actions && (
                      <td className="px-6 py-4 text-right space-x-2">{actions(row)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          <EmptyState
            title={emptyMessage}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      )}

      {pagination && !loading && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-xs text-gray-500">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Filas:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <nav className="flex items-center gap-0.5" aria-label="Paginación">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={cn(
                  'px-2 py-1 text-xs rounded border transition-colors',
                  pagination.page <= 1
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50',
                )}
                aria-label="Página anterior"
              >
                ‹
              </button>

              {getPageNumbers(pagination.page, Math.ceil(pagination.total / pagination.pageSize)).map((p, i) =>
                p === 'dots' ? (
                  <span key={`dots-${i}`} className="px-1.5 text-xs text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded transition-colors',
                      p === pagination.page
                        ? 'bg-indigo-600 text-white font-medium'
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
                  'px-2 py-1 text-xs rounded border transition-colors',
                  pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50',
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
        <div className="text-xs text-gray-400 mt-2 text-right">
          {processed.length} de {data.length} registros
        </div>
      )}
    </div>
  )
}

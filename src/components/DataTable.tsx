import { useState, useMemo, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef as TanStackColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { ColumnDef, FilterValues, PaginationState } from '../types/table'
import { applyFilters } from '../utils/tableFilters'
import { cn } from '../shared/utils/cn'
import { EmptyState } from '../shared/components/ui/EmptyState'
import { SkeletonTable } from '../shared/components/ui/SkeletonTable'
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
  onFilterChange?: (filters: Record<string, string>) => void
}

const pageSizeOptions = [10, 20, 50, 100]
const DEBOUNCE_MS = 300

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

function rowValue<T>(row: T, key: string): any {
  const keys = key.split('.')
  let val: any = row
  for (const k of keys) {
    val = val?.[k as keyof typeof val]
  }
  return val
}

function toTanStackColumns<T>(cols: ColumnDef<T>[], actions?: (row: T) => React.ReactNode): TanStackColumnDef<T>[] {
  const result: TanStackColumnDef<T>[] = cols.map((col) => ({
    id: col.key,
    header: col.label,
    accessorFn: col.getValue ?? ((row: T) => rowValue(row, col.key)),
    cell: col.render ? (info) => col.render!(info.getValue(), info.row.original) : undefined,
    enableSorting: col.sortable ?? false,
  }))

  if (actions) {
    result.push({
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: (info) => actions(info.row.original),
    })
  }

  return result
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
  onFilterChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filters, setFilters] = useState<FilterValues>({})
  const filtersRef = useRef<FilterValues>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const filteredData = useMemo(() => {
    return applyFilters(data, columns, filters)
  }, [data, columns, filters])

  const tanStackColumns = useMemo(() => toTanStackColumns(columns, actions), [columns, actions])

  const table = useReactTable({
    data: filteredData,
    columns: tanStackColumns,
    state: {
      sorting,
      columnVisibility: columns.reduce<Record<string, boolean>>((acc, col) => {
        acc[col.key] = true
        return acc
      }, {}),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination ? Math.ceil(pagination.total / pagination.pageSize) : -1,
  })

  const triggerFilterChange = (newFilters: FilterValues) => {
    if (onPageChange) onPageChange(1)
    if (onFilterChange) {
      const strFilters: Record<string, string> = {}
      for (const [k, v] of Object.entries(newFilters)) {
        if (v !== '' && v != null) {
          strFilters[k] = String(v)
        }
      }
      onFilterChange(strFilters)
    }
  }

  const updateFilter = (key: string, value: any) => {
    filtersRef.current = { ...filtersRef.current, [key]: value }
    setFilters(filtersRef.current)

    const col = columns.find((c) => c.key === key)
    const isInstant = col?.filterType === 'select' || col?.filterType === 'boolean'

    if (isInstant) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = null
      triggerFilterChange(filtersRef.current)
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        triggerFilterChange(filtersRef.current)
      }, DEBOUNCE_MS)
    }
  }

  const clearFilters = () => {
    filtersRef.current = {}
    setFilters({})
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = null
    if (onPageChange) onPageChange(1)
    if (onFilterChange) onFilterChange({})
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
                onClick={clearFilters}
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
            columns={table.getAllColumns().length}
            rows={5}
            actions={!!actions}
          />
        </div>
      ) : table.getRowModel().rows.length > 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  {table.getHeaderGroups().map((hg) =>
                    hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          styles.headerCell,
                          header.column.getCanSort() && styles.headerCellSortable,
                        )}
                        onClick={() => header.column.getCanSort() && header.column.toggleSorting()}
                      >
                        <span className={styles.sortLabel}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                            <span className={styles.sortIcon}>
                              {header.column.getIsSorted() === 'asc' ? '\u25B2' : '\u25BC'}
                            </span>
                          )}
                        </span>
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={rowKey(row.original)}
                    className={cn(styles.tableRow, onRowClick && styles.tableRowClickable)}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={styles.tableCell}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
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

      {!pagination && !loading && table.getRowModel().rows.length > 0 && (
        <div className={styles.recordCount}>
          {table.getRowModel().rows.length} de {data.length} registros
        </div>
      )}
    </div>
  )
}

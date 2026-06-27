import { useState, useMemo } from 'react'
import type { ColumnDef, SortState, FilterValues } from '../types/table'
import { applyFilters, applySorting } from '../utils/tableFilters'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  emptyMessage?: string
  rowKey: (row: T) => string | number
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyMessage = 'No hay registros',
  rowKey,
  actions,
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
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="text-center py-12 text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="text-center py-12 text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                processed.map((row) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && processed.length > 0 && (
        <div className="text-xs text-gray-400 mt-2 text-right">
          {processed.length} de {data.length} registros
        </div>
      )}
    </div>
  )
}

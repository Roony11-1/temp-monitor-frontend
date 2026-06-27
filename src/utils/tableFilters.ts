import type { ColumnDef, SortState, FilterValues } from '../types/table'

function getValue<T>(row: T, column: ColumnDef<T>): any {
  if (column.getValue) return column.getValue(row)
  const keys = column.key.split('.')
  let val: any = row
  for (const k of keys) {
    val = val?.[k as keyof typeof val]
  }
  return val
}

function matchText(value: any, filter: string): boolean {
  if (value == null) return false
  return String(value).toLowerCase().includes(filter.toLowerCase())
}

function matchNumber(value: any, filter: string): boolean {
  if (value == null || filter === '') return false
  const num = Number(value)
  const [op, raw] = filter.startsWith('>') || filter.startsWith('<')
    ? [filter[0], filter.slice(1)]
    : ['=', filter]
  const target = Number(raw)
  if (isNaN(num) || isNaN(target)) return false
  switch (op) {
    case '>': return num > target
    case '<': return num < target
    default: return num === target
  }
}

function matchBoolean(value: any, filter: string): boolean {
  if (filter === 'all' || filter === '') return true
  return filter === 'true' ? value === true : value === false
}

function matchSelect(value: any, filter: string): boolean {
  if (filter === '' || filter === 'all') return true
  return String(value) === filter
}

export function applyFilters<T>(data: T[], columns: ColumnDef<T>[], filters: FilterValues): T[] {
  return data.filter((row) => {
    return columns.every((col) => {
      const filter = filters[col.key]
      if (filter === undefined || filter === null || filter === '') return true

      const value = getValue(row, col)
      const type = col.filterType || 'text'

      switch (type) {
        case 'text': return matchText(value, filter)
        case 'number': return matchNumber(value, filter)
        case 'boolean': return matchBoolean(value, filter)
        case 'select': return matchSelect(value, filter)
        default: return true
      }
    })
  })
}

export function applySorting<T>(data: T[], columns: ColumnDef<T>[], sort: SortState | null): T[] {
  if (!sort) return data

  const col = columns.find((c) => c.key === sort.key)
  if (!col) return data

  return [...data].sort((a, b) => {
    const va = getValue(a, col)
    const vb = getValue(b, col)

    if (va == null && vb == null) return 0
    if (va == null) return 1
    if (vb == null) return -1

    let cmp = 0
    if (typeof va === 'number' && typeof vb === 'number') {
      cmp = va - vb
    } else if (va instanceof Date && vb instanceof Date) {
      cmp = va.getTime() - vb.getTime()
    } else {
      cmp = String(va).localeCompare(String(vb))
    }

    return sort.direction === 'desc' ? -cmp : cmp
  })
}

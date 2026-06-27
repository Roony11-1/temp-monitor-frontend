import type { ReactNode } from 'react'

export type FilterType = 'text' | 'number' | 'boolean' | 'select'

export interface ColumnDef<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  filterType?: FilterType
  filterOptions?: { label: string; value: any }[]
  render?: (value: any, row: T) => ReactNode
  getValue?: (row: T) => any
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface FilterValues {
  [key: string]: any
}

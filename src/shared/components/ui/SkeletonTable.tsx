import { cn } from '../../utils/cn'

interface SkeletonTableProps {
  columns: number
  rows?: number
  actions?: boolean
}

function SkeletonCell({
  width,
  className,
}: {
  width: string
  className?: string
}) {
  return (
    <div
      className={cn('animate-pulse bg-gray-200 rounded h-4', className)}
      style={{ width }}
    />
  )
}

export function SkeletonTable({
  columns,
  rows = 5,
  actions = false,
}: SkeletonTableProps) {
  const totalCols = actions ? columns + 1 : columns

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {Array.from({ length: totalCols }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <SkeletonCell
                  width={i === totalCols - 1 && actions ? '60px' : '80px'}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: totalCols }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <SkeletonCell
                    width={
                      colIdx === 0
                        ? '140px'
                        : colIdx === totalCols - 1 && actions
                          ? '80px'
                          : '100px'
                    }
                    className={colIdx === 0 ? 'h-5' : 'h-4'}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

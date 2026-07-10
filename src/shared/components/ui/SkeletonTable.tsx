import styles from './SkeletonTable.module.css'

interface SkeletonTableProps {
  columns: number
  rows?: number
  actions?: boolean
}

export function SkeletonTable({
  columns,
  rows = 5,
  actions = false,
}: SkeletonTableProps) {
  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className={styles.headerCell}>
              <div className={styles.headerContent} />
            </th>
          ))}
          {actions && <th className={styles.headerCell} />}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx} className={styles.row}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className={styles.cell}>
                <div
                  className={
                    colIdx === 0 ? styles.cellContent : styles.cellContentShort
                  }
                />
              </td>
            ))}
            {actions && (
              <td className={styles.actions}>
                <div className={styles.actionsContent} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

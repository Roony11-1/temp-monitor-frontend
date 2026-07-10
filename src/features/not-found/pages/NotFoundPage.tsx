import styles from './NotFoundPage.module.css'

export function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>Página no encontrada</p>
      </div>
    </div>
  )
}

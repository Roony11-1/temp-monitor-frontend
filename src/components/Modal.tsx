import type { ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  title: string
  onClose: () => void
  onSave: () => void
  isSaving: boolean
  children: ReactNode
}

export function Modal({
  title,
  onClose,
  onSave,
  isSaving,
  children,
}: ModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button onClick={onClose} className={styles.close}>
            &times;
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>
          <button onClick={onClose} disabled={isSaving} className={styles.cancel}>
            Cancelar
          </button>
          <button onClick={onSave} disabled={isSaving} className={styles.save}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

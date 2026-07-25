import { useFormContext } from 'react-hook-form'
import styles from './FormButton.module.css'

interface FormButtonProps {
  children: string
  isLoading?: boolean
}

export function FormButton({ children, isLoading }: FormButtonProps) {
  const { formState: { isSubmitting } } = useFormContext()
  const busy = isLoading || isSubmitting

  return (
    <button type="submit" disabled={busy} className={styles.button}>
      {busy ? 'Guardando...' : children}
    </button>
  )
}

import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { cn } from '../../utils/cn'
import styles from './FormInput.module.css'

interface FormInputProps {
  label: string
  name: string
  type?: string
  rules?: RegisterOptions
  placeholder?: string
  disabled?: boolean
  step?: string
}

export function FormInput({ label, name, type = 'text', rules, placeholder, disabled, step }: FormInputProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <div>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <input
        id={name}
        type={type}
        {...register(name, rules)}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        className={cn(styles.input, error && styles.inputError)}
      />
      {error && <p className={styles.error}>{error.message as string}</p>}
    </div>
  )
}

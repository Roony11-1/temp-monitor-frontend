import { useFormContext, type RegisterOptions } from 'react-hook-form'
import { cn } from '../../utils/cn'
import styles from './FormSelect.module.css'

interface SelectOption {
  label: string
  value: string | number
}

interface FormSelectProps {
  label: string
  name: string
  options: SelectOption[]
  rules?: RegisterOptions
  placeholder?: string
  disabled?: boolean
}

export function FormSelect({ label, name, options, rules, placeholder, disabled }: FormSelectProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]

  return (
    <div>
      <label htmlFor={name} className={styles.label}>{label}</label>
      <select
        id={name}
        {...register(name, rules)}
        disabled={disabled}
        className={cn(styles.select, error && styles.selectError)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className={styles.error}>{error.message as string}</p>}
    </div>
  )
}

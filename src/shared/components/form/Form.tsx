import { type ReactNode } from 'react'
import { FormProvider, type UseFormReturn, type FieldValues, type SubmitHandler } from 'react-hook-form'
import styles from './Form.module.css'

interface FormProps<T extends FieldValues> {
  methods: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  title?: string
  children: ReactNode
}

export function Form<T extends FieldValues>({ methods, onSubmit, title, children }: FormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {children}
      </form>
    </FormProvider>
  )
}

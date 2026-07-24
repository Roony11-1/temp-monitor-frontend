import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { cambiarPassword } from '../../usuarios/api/usuarios'
import toast from 'react-hot-toast'
import styles from './PasswordForm.module.css'

export interface PasswordFormHandle {
  submit: () => Promise<void>
}

interface Props {
  userId: number
  onSaved: () => void
}

type FormValues = { nuevaPassword: string }

export const PasswordForm = forwardRef<PasswordFormHandle, Props>(({ userId, onSaved }, ref) => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { nuevaPassword: '' },
  })

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(
      async (data) => {
        await cambiarPassword(userId, data.nuevaPassword)
        toast.success('Contraseña actualizada')
        reset()
        onSaved()
      },
      (errors) => {
        const first = Object.values(errors)[0]
        if (first?.message) toast.error(first.message)
      },
    ),
  }), [handleSubmit, userId, onSaved])

  return (
    <div>
      <label className={styles.label}>Nueva contraseña</label>
      <input
        type="password"
        {...register('nuevaPassword', { required: 'La contraseña es obligatoria' })}
        className={styles.input}
      />
    </div>
  )
})

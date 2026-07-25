import { useForm } from 'react-hook-form'
import { cambiarPassword } from '../../usuarios/api/usuarios'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormButton } from '../../../shared/components/form'

interface Props {
  userId: number
  onSaved: () => void
  onCancel?: () => void
}

type FormValues = { nuevaPassword: string }

export function PasswordForm({ userId, onSaved, onCancel }: Props) {
  const methods = useForm<FormValues>({
    defaultValues: { nuevaPassword: '' },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await cambiarPassword(userId, data.nuevaPassword)
      toast.success('Contraseña actualizada')
      methods.reset()
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al actualizar contraseña'))
    }
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput
        label="Nueva contraseña"
        name="nuevaPassword"
        type="password"
        rules={{ required: 'La contraseña es obligatoria' }}
      />
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
        )}
        <FormButton>Cambiar contraseña</FormButton>
      </div>
    </Form>
  )
}

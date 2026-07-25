import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { registrarSensor } from '../../sensores/api/sensores'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormButton } from '../../../shared/components/form'
import type { RegistroSensorResponse } from '../../../types'

type FormValues = { macAddress: string }

interface Props {
  onSuccess: (response: RegistroSensorResponse) => void
}

export function RegistrarSensorForm({ onSuccess }: Props) {
  const methods = useForm<FormValues>({
    defaultValues: { macAddress: '' },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await registrarSensor({ macAddress: data.macAddress })
      toast.success('Sensor registrado correctamente')
      methods.reset()
      onSuccess(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al registrar el sensor'))
    }
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput
        label="MAC Address"
        name="macAddress"
        placeholder="00:1A:2B:3C:4D:5E"
        rules={{ required: 'La dirección MAC es obligatoria' }}
      />
      <FormButton>Registrar</FormButton>
    </Form>
  )
}

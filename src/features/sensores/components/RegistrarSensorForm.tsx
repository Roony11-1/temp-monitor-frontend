import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { registrarSensor } from '../../../api/sensores'
import { getApiErrorMessage } from '../../../shared/utils/error'
import type { Sensor } from '../../../types'
import styles from './RegistrarSensorForm.module.css'

type FormValues = { macAddress: string }

interface RegistrarSensorFormProps {
  onSuccess: (sensor: Sensor) => void
}

export function RegistrarSensorForm({ onSuccess }: RegistrarSensorFormProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { macAddress: '' },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await registrarSensor({ macAddress: data.macAddress })
      toast.success('Sensor registrado correctamente')
      reset()
      onSuccess(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al registrar el sensor'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className={styles.label}>
          MAC Address
        </label>
        <input
          type="text"
          {...register('macAddress')}
          placeholder="00:1A:2B:3C:4D:5E"
          className={styles.input}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.button}
      >
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  )
}

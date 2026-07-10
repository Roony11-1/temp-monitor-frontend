import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { registrarSensor } from '../../../api/sensores'
import { getApiErrorMessage } from '../../../shared/utils/error'
import type { Sensor } from '../../../types'

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MAC Address
        </label>
        <input
          type="text"
          {...register('macAddress')}
          placeholder="00:1A:2B:3C:4D:5E"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  )
}

import { useForm } from 'react-hook-form'
import { useActualizarSensor } from '../hooks/useSensores'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormSelect, FormButton } from '../../../shared/components/form'
import type { Camara } from '../../../types'

interface SensorFormValues {
  estado: string
  camaraId?: number
}

interface Props {
  uuid: string
  defaultValues: { estado: string; camaraId: number | null }
  camaras: Camara[]
  onSaved: () => void
}

export function SensorForm({ uuid, defaultValues, camaras, onSaved }: Props) {
  const methods = useForm<SensorFormValues>({
    defaultValues: {
      estado: defaultValues.estado,
      camaraId: defaultValues.camaraId ?? undefined,
    },
  })

  const mutation = useActualizarSensor()

  const onSubmit = async (data: SensorFormValues) => {
    try {
      await mutation.mutateAsync({ uuid, data })
      toast.success('Sensor actualizado')
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar cambios'))
    }
  }

  const estadoOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Deshabilitado', value: 'DESHABILITADO' },
  ]

  const camaraOptions = camaras.map((c) => ({ label: c.nombre, value: c.id }))

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormSelect
        label="Estado"
        name="estado"
        options={estadoOptions}
        rules={{ required: 'El estado es obligatorio' }}
      />
      <FormSelect
        label="Cámara"
        name="camaraId"
        options={camaraOptions}
        placeholder="Sin cámara"
        rules={{ setValueAs: (v: string) => v ? Number(v) : undefined }}
      />
      <FormButton isLoading={mutation.isPending}>Guardar cambios</FormButton>
    </Form>
  )
}

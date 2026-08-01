import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { asignarSensor } from '../../sensores/api/sensores'
import { getCamaras } from '../../camaras/api/camaras'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormSelect, FormButton } from '../../../shared/components/form'
import type { Sensor, CamaraSummaryResponse } from '../../../types'

interface Props {
  uuid: string
  apiKey: string
  onSuccess: (sensor: Sensor) => void
}

interface FormValues {
  camaraId: string
}

export function AsignarSensorForm({ uuid, apiKey, onSuccess }: Props) {
  const [camaras, setCamaras] = useState<CamaraSummaryResponse[]>([])
  const methods = useForm<FormValues>()

  useEffect(() => {
    getCamaras()
      .then(setCamaras)
      .catch(() => toast.error('Error al cargar cámaras'))
  }, [])

  const onSubmit = async (data: FormValues) => {
    if (!data.camaraId) {
      toast.error('Debe seleccionar una cámara')
      return
    }
    try {
      const result = await asignarSensor({ uuid, apiKey, camaraId: Number(data.camaraId) })
      toast.success('Sensor asignado correctamente')
      onSuccess(result)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al asignar el sensor'))
    }
  }

  const camaraOptions = camaras.map((c) => ({ label: c.nombre, value: c.id }))

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">UUID</label>
        <input type="text" value={uuid} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500" readOnly disabled />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
        <input type="text" value={apiKey} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500" readOnly disabled />
      </div>
      <FormSelect
        label="Asignar a Cámara"
        name="camaraId"
        options={camaraOptions}
        placeholder="-- Seleccione una cámara --"
        rules={{ required: 'Debe seleccionar una cámara' }}
      />
      <FormButton>Asignar a Cámara</FormButton>
    </Form>
  )
}

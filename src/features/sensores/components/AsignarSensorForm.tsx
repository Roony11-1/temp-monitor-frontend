import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { asignarSensor } from '../../../api/sensores'
import { getCamaras } from '../../../api/camaras'
import { getApiErrorMessage } from '../../../shared/utils/error'
import type { Sensor, Camara } from '../../../types'
import styles from './RegistrarSensorForm.module.css'

interface AsignarSensorFormProps {
  uuid: string
  apiKey: string
  onSuccess: (sensor: Sensor) => void
}

export function AsignarSensorForm({ uuid, apiKey, onSuccess }: AsignarSensorFormProps) {
  const [camaras, setCamaras] = useState<Camara[]>([])
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ camaraId: string }>()

  useEffect(() => {
    getCamaras()
      .then(setCamaras)
      .catch(() => toast.error('Error al cargar cámaras'))
  }, [])

  const onSubmit = async (data: { camaraId: string }) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div>
        <label className={styles.label}>UUID</label>
        <input type="text" value={uuid} className={styles.input} readOnly disabled />
      </div>
      <div>
        <label className={styles.label}>API Key</label>
        <input type="text" value={apiKey} className={styles.input} readOnly disabled />
      </div>
      <div>
        <label className={styles.label}>Asignar a Cámara</label>
        <select {...register('camaraId')} className={styles.input} required>
          <option value="">-- Seleccione una cámara --</option>
          {camaras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.button}
      >
        {isSubmitting ? 'Asignando...' : 'Asignar a Cámara'}
      </button>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getSensores, registrarLecturaSensor } from '../../../api/sensores'
import { getApiErrorMessage } from '../../../shared/utils/error'
import type { Sensor } from '../../../types'
import styles from './RegistrarSensorPage.module.css'

type FormValues = { sensorUuid: string; temperatura: string }

export function SimularLectura() {
  const [sensores, setSensores] = useState<Sensor[]>([])
  const [ultimoEnvio, setUltimoEnvio] = useState<{ uuid: string; temp: number } | null>(null)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { sensorUuid: '', temperatura: '' },
  })

  useEffect(() => {
    getSensores().then(setSensores).catch(() => toast.error('Error al cargar sensores'))
  }, [])

  const onSubmit = async (data: FormValues) => {
    if (!data.sensorUuid) {
      toast.error('Seleccione un sensor')
      return
    }
    const temp = Number(data.temperatura)
    if (isNaN(temp)) {
      toast.error('Ingrese una temperatura válida')
      return
    }
    try {
      await registrarLecturaSensor(data.sensorUuid, temp)
      toast.success(`Lectura enviada: ${temp}°C`)
      setUltimoEnvio({ uuid: data.sensorUuid, temp })
      reset({ sensorUuid: data.sensorUuid, temperatura: '' })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al enviar lectura'))
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Simular Lectura</h1>
      <p className={styles.subtitle}>Envía una medición de temperatura simulada para un sensor</p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <div>
          <label className={styles.label}>Sensor</label>
          <select {...register('sensorUuid')} className={styles.input}>
            <option value="">-- Seleccione un sensor --</option>
            {sensores.map((s) => (
              <option key={s.uuid} value={s.uuid}>
                {s.macAddress} — {s.camara?.nombre ?? 'Sin cámara'} ({s.estado})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.label}>Temperatura (°C)</label>
          <input
            type="number"
            step="0.1"
            {...register('temperatura')}
            placeholder="25.5"
            className={styles.input}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.button}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Lectura'}
        </button>
      </form>

      {ultimoEnvio && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>Último envío</h2>
          <div className={styles.card}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Sensor UUID:</span>
              <span className={styles.mono}>{ultimoEnvio.uuid}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Temperatura:</span>
              <span>{ultimoEnvio.temp}°C</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

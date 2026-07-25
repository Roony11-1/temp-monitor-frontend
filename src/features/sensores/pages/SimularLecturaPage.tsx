import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useSensores, useRegistrarLecturaSensor } from '../hooks/useSensores'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormSelect, FormInput, FormButton } from '../../../shared/components/form'
import type { Sensor } from '../../../types'
import styles from './RegistrarSensorPage.module.css'

type FormValues = { sensorUuid: string; temperatura: string }

export function SimularLectura() {
  const { data: sensores = [] } = useSensores()
  const [ultimoEnvio, setUltimoEnvio] = useState<{ uuid: string; temp: number } | null>(null)
  const methods = useForm<FormValues>({
    defaultValues: { sensorUuid: '', temperatura: '' },
  })
  const enviarMutation = useRegistrarLecturaSensor()

  const onSubmit = async (data: FormValues) => {
    const temp = Number(data.temperatura)
    if (isNaN(temp)) {
      toast.error('Ingrese una temperatura válida')
      return
    }
    try {
      await enviarMutation.mutateAsync({ uuid: data.sensorUuid, temperatura: temp })
      toast.success(`Lectura enviada: ${temp}°C`)
      setUltimoEnvio({ uuid: data.sensorUuid, temp })
      methods.reset({ sensorUuid: data.sensorUuid, temperatura: '' })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al enviar lectura'))
    }
  }

  const sensorOptions = sensores.map((s: Sensor) => ({
    label: `${s.macAddress} — ${s.camara?.nombre ?? 'Sin cámara'} (${s.estado})`,
    value: s.uuid,
  }))

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Simular Lectura</h1>
      <p className={styles.subtitle}>Envía una medición de temperatura simulada para un sensor</p>

      <div className="max-w-md">
        <Form methods={methods} onSubmit={onSubmit}>
          <FormSelect
            label="Sensor"
            name="sensorUuid"
            options={sensorOptions}
            placeholder="-- Seleccione un sensor --"
            rules={{ required: 'Seleccione un sensor' }}
          />
          <FormInput
            label="Temperatura (°C)"
            name="temperatura"
            type="number"
            step="0.1"
            placeholder="25.5"
            rules={{ required: 'Ingrese una temperatura' }}
          />
          <FormButton isLoading={enviarMutation.isPending}>Enviar Lectura</FormButton>
        </Form>
      </div>

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

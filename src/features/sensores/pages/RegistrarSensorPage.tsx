import { useState } from 'react'
import { RegistrarSensorForm } from '../components/RegistrarSensorForm'
import { AsignarSensorForm } from '../components/AsignarSensorForm'
import { useConsultarEstadoSensor } from '../hooks/useSensores'
import type { Sensor, RegistroSensorResponse } from '../../../types'
import toast from 'react-hot-toast'
import styles from './RegistrarSensorPage.module.css'

type Step = 'registrar' | 'asignar' | 'completo'

export function RegistrarSensor() {
  const [step, setStep] = useState<Step>('registrar')
  const [registro, setRegistro] = useState<RegistroSensorResponse | null>(null)
  const [sensor, setSensor] = useState<Sensor | null>(null)
  const [estado, setEstado] = useState<string | null>(null)

  const handleRegistroExitoso = (response: RegistroSensorResponse) => {
    setRegistro(response)
    setStep('asignar')
  }

  const handleAsignacionExitosa = (sensorAsignado: Sensor) => {
    setSensor(sensorAsignado)
    setStep('completo')
  }

  const { refetch: consultarEstado, isFetching: consultando } = useConsultarEstadoSensor(sensor?.uuid ?? '')

  const handleConsultarEstado = async () => {
    if (!sensor?.uuid) return
    const result = await consultarEstado()
    if (result.data) {
      setEstado(result.data)
      toast.success(`Estado del sensor: ${result.data}`)
    } else {
      toast.error('Error al consultar estado')
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Sensor</h1>

      {step === 'registrar' && (
        <section>
          <p className={styles.subtitle}>Paso 1: Registrar el sensor con su dirección MAC</p>
          <RegistrarSensorForm onSuccess={handleRegistroExitoso} />
        </section>
      )}

      {step === 'asignar' && registro && (
        <section>
          <p className={styles.subtitle}>Paso 2: Asignar el sensor a una cámara</p>
          <AsignarSensorForm
            uuid={registro.uuid}
            apiKey={registro.apiKey}
            onSuccess={handleAsignacionExitosa}
          />
        </section>
      )}

      {step === 'completo' && sensor && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>Sensor Registrado y Asignado</h2>
          <div className={styles.card}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>ID:</span>
              <span>{sensor.id}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>MAC Address:</span>
              <span>{sensor.macAddress}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>UUID:</span>
              <span className={styles.mono}>{sensor.uuid}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Cámara:</span>
              <span>{sensor.camara?.nombre ?? 'Sin asignar'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Estado:</span>
              <span className={sensor.estado === 'ACTIVO' ? styles.badgeActivo : styles.badgePendiente}>
                {sensor.estado}
              </span>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              onClick={handleConsultarEstado}
              disabled={consultando}
              className={styles.button}
            >
              {consultando ? 'Consultando...' : 'Consultar Estado'}
            </button>
            {estado !== null && (
              <span className={styles.estadoActual}>
                Estado actual: <strong>{estado}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { RegistrarSensorForm } from '../components/RegistrarSensorForm'
import type { Sensor } from '../../../types'
import styles from './RegistrarSensorPage.module.css'

export function RegistrarSensor() {
  const [sensor, setSensor] = useState<Sensor | null>(null)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Sensor</h1>
      <RegistrarSensorForm onSuccess={setSensor} />
      {sensor && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>Sensor Creado</h2>
          <pre className={styles.pre}>
            {JSON.stringify(sensor, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { RegistrarSensorForm } from '../components/RegistrarSensorForm'
import type { Sensor } from '../../../types'

export function RegistrarSensor() {
  const [sensor, setSensor] = useState<Sensor | null>(null)

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrar Sensor</h1>
      <RegistrarSensorForm onSuccess={setSensor} />
      {sensor && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sensor Creado</h2>
          <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto text-sm">
            {JSON.stringify(sensor, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

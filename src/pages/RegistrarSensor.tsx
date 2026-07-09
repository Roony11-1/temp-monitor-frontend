import { useState } from 'react'
import toast from 'react-hot-toast'
import { registrarSensor } from '../api/sensores'
import type { Sensor } from '../types'

export function RegistrarSensor() {
  const [macAddress, setMacAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [sensor, setSensor] = useState<Sensor | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSensor(null)

    try {
      const result = await registrarSensor({ macAddress })
      setSensor(result)
      toast.success('Sensor registrado correctamente')
    } catch {
      toast.error('Error al registrar el sensor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrar Sensor</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MAC Address
          </label>
          <input
            type="text"
            value={macAddress}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="00:1A:2B:3C:4D:5E"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

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

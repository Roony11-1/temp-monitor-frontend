import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmpresa } from '../../../api/empresas'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { EmpresaForm, type EmpresaFormHandle } from '../components/EmpresaForm'
import type { Empresa } from '../../../types'

export function EmpresaEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const formRef = useRef<EmpresaFormHandle>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getEmpresa(Number(id))
      .then(setEmpresa)
      .catch(() => navigate('/empresas'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="200px" /></Card>
    </div>
  )

  if (!empresa) return null

  const empresaData = {
    id: empresa.id,
    nombre: empresa.nombre,
    direccion: empresa.direccion || '',
    telefono: empresa.telefono || '',
    email: empresa.email || '',
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      navigate(`/empresas/${id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/empresas/${id}`)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar {empresa.nombre}</h1>
      </div>

      <Card>
        <EmpresaForm ref={formRef} empresa={empresaData} onSaved={() => {}} />
      </Card>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(`/empresas/${id}`)}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

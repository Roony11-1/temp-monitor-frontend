import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCamara } from '../../../api/camaras'
import { getSucursales } from '../../../api/sucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { CamaraForm, type CamaraFormHandle } from '../components/CamaraForm'
import type { Camara, Sucursal } from '../../../types'

export function CamaraEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<CamaraFormHandle>(null)
  const [camara, setCamara] = useState<Camara | null>(null)
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA') ?? false

  useEffect(() => {
    if (!id) return
    Promise.all([getCamara(Number(id)), getSucursales()])
      .then(([cam, sucs]) => {
        setCamara(cam)
        setSucursales(sucs)
      })
      .catch(() => navigate('/camaras'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="space-y-6">
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="200px" /></Card>
    </div>
  )

  if (!camara) return null

  const camaraData = {
    id: camara.id,
    nombre: camara.nombre,
    descripcion: camara.descripcion || '',
    sucursalId: camara.sucursalId,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      navigate(`/camaras/${id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/camaras/${id}`)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar {camara.nombre}</h1>
      </div>

      <Card>
        <CamaraForm
          ref={formRef}
          camara={camaraData}
          sucursales={sucursales}
          canSelectSucursal={isSuperAdmin || isAdminEmpresa}
          defaultSucursalId={camara.sucursalId}
          onSaved={() => {}}
        />
      </Card>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(`/camaras/${id}`)}
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

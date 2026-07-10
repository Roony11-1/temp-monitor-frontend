import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCamara } from '../../../api/camaras'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Camara } from '../../../types'

export function CamaraDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [camara, setCamara] = useState<Camara | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCamara(Number(id))
      .then(setCamara)
      .catch(() => navigate('/camaras'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (!camara) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/camaras')}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{camara.nombre}</h1>
            <p className="text-sm text-gray-500">Detalle de cámara</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/camaras/${id}/editar`)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Editar
        </button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Descripción</p>
            <p className="text-sm text-gray-900 mt-1">{camara.descripcion || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <Badge variant={camara.activo ? 'success' : 'danger'}>
                {camara.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

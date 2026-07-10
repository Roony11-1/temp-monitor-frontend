import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSucursal } from '../../../api/sucursales'
import { getCamarasBySucursal } from '../../../api/camaras'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../components/DataTable'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Sucursal, Camara } from '../../../types'
import type { ColumnDef } from '../../../types/table'

export function SucursalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sucursal, setSucursal] = useState<Sucursal | null>(null)
  const [camaras, setCamaras] = useState<Camara[]>([])
  const [loading, setLoading] = useState(true)

  const columns: ColumnDef<Camara>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v) => (
        <div className="flex justify-center">
          <Badge variant={v ? 'success' : 'danger'}>{v ? 'Activo' : 'Inactivo'}</Badge>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getSucursal(Number(id)),
      getCamarasBySucursal(Number(id)),
    ])
      .then(([suc, cams]) => {
        setSucursal(suc)
        setCamaras(cams)
      })
      .catch(() => navigate('/sucursales'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="120px" /></Card>
        <Card><LoadingSkeleton width="100%" height="200px" /></Card>
      </div>
    )
  }

  if (!sucursal) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sucursales')}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sucursal.nombre}</h1>
            <p className="text-sm text-gray-500">Detalle de sucursal</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/sucursales/${id}/editar`)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Editar
        </button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dirección</p>
            <p className="text-sm text-gray-900 mt-1">{sucursal.direccion || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</p>
            <p className="text-sm text-gray-900 mt-1">{sucursal.telefono || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <Badge variant={sucursal.activo ? 'success' : 'danger'}>
                {sucursal.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Cámaras ({camaras.length})
        </h2>
        <DataTable
          data={camaras}
          columns={columns}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/camaras/${c.id}`)}
          emptyMessage="No tiene cámaras asignadas"
        />
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmpresa } from '../../../api/empresas'
import { getSucursalesByEmpresa } from '../../../api/sucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { Badge as Badge2 } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../components/DataTable'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Empresa, Sucursal } from '../../../types'
import type { ColumnDef } from '../../../types/table'

export function EmpresaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')

  const columns: ColumnDef<Sucursal>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'direccion',
      label: 'Dirección',
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
          <Badge2 variant={v ? 'success' : 'danger'}>{v ? 'Activo' : 'Inactivo'}</Badge2>
        </div>
      ),
    },
  ]

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getEmpresa(Number(id)),
      getSucursalesByEmpresa(Number(id)),
    ])
      .then(([emp, sucs]) => {
        setEmpresa(emp)
        setSucursales(sucs)
      })
      .catch(() => navigate('/empresas'))
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

  if (!empresa) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/empresas')}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{empresa.nombre}</h1>
            <p className="text-sm text-gray-500">Detalle de empresa</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/empresas/${id}/editar`)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dirección</p>
            <p className="text-sm text-gray-900 mt-1">{empresa.direccion || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</p>
            <p className="text-sm text-gray-900 mt-1">{empresa.telefono || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm text-gray-900 mt-1">{empresa.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <Badge variant={empresa.activo ? 'success' : 'danger'}>
                {empresa.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Sucursales ({sucursales.length})
        </h2>
        <DataTable
          data={sucursales}
          columns={columns}
          rowKey={(s) => s.id}
          onRowClick={(s) => navigate(`/sucursales/${s.id}`)}
          emptyMessage="No tiene sucursales asignadas"
        />
      </div>
    </div>
  )
}

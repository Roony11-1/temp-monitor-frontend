import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCamaras,
  getCamarasBySucursal,
  deleteCamara,
} from '../../../api/camaras'
import { getSucursales, getSucursalesByEmpresa, getSucursal } from '../../../api/sucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { CamaraForm, type CamaraFormHandle } from '../components/CamaraForm'
import type { Camara, Sucursal } from '../../../types'
import type { ColumnDef } from '../../../types/table'

export function Camaras() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<CamaraFormHandle>(null)
  const [camaras, setCamaras] = useState<Camara[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Camara | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const sucursalNombre = useMemo(
    () => (id: number) => sucursales.find((s) => s.id === id)?.nombre || '-',
    [sucursales],
  )

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
      key: 'sucursalId',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: sucursales.map((s) => ({ label: s.nombre, value: String(s.id) })),
      render: (v) => <span className="text-gray-500">{sucursalNombre(v)}</span>,
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v) => (
        <div className="flex justify-center">
          <Badge variant={v ? 'success' : 'danger'}>
            {v ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ),
    },
  ]

  const loadSucursales = async () => {
    if (isSuperAdmin) {
      return getSucursales()
    } else if (isAdminEmpresa && user?.empresaId) {
      return getSucursalesByEmpresa(user.empresaId)
    } else if (user?.sucursalId) {
      const s = await getSucursal(user.sucursalId)
      return [s]
    }
    return Promise.resolve([])
  }

  const loadCamaras = () => {
    if (isSuperAdmin) {
      return getCamaras()
    } else if (user?.sucursalId) {
      return getCamarasBySucursal(user.sucursalId)
    } else if (isAdminEmpresa) {
      return getCamaras()
    }
    return Promise.resolve([])
  }

  const load = () => {
    setLoading(true)
    Promise.all([loadCamaras(), loadSucursales()])
      .then(([cams, sucs]) => {
        if (!isSuperAdmin && isAdminEmpresa && user?.empresaId) {
          const empresaSucIds = sucs.map((s) => s.id)
          setCamaras(cams.filter((c) => empresaSucIds.includes(c.sucursalId)))
        } else {
          setCamaras(cams)
        }
        setSucursales(sucs)
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (cam: Camara) => {
    setEditing(cam)
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta cámara?')) return
    try {
      await deleteCamara(id)
      toast.success('Cámara eliminada')
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const camaraData = editing
    ? {
        id: editing.id,
        nombre: editing.nombre,
        descripcion: editing.descripcion || '',
        sucursalId: editing.sucursalId,
      }
    : undefined

  const defaultSucursalId = user?.sucursalId || (sucursales.length === 1 ? sucursales[0].id : 0)
  const canSelectSucursal = isSuperAdmin || isAdminEmpresa

  return (
    <div>
      <PageHeader title="Cámaras" description="Gestión de cámaras de temperatura">
        {canManage && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva cámara
          </button>
        )}
      </PageHeader>

      <DataTable
        data={camaras}
        columns={columns}
        loading={loading}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`/camaras/${c.id}`)}
        emptyMessage="No hay cámaras registradas"
        actions={(cam) => (
          <>
            <button
              onClick={() => openEdit(cam)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(cam.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Eliminar
            </button>
          </>
        )}
      />

      {showModal && (
        <Modal
          title={editing ? 'Editar cámara' : 'Nueva cámara'}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={saving}
        >
          <CamaraForm
            ref={formRef}
            camara={camaraData}
            sucursales={sucursales}
            canSelectSucursal={canSelectSucursal ?? false}
            defaultSucursalId={defaultSucursalId}
            onSaved={() => {}}
          />
        </Modal>
      )}
    </div>
  )
}

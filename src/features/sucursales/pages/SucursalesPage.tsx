import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSucursales,
  getSucursalesByEmpresa,
  getSucursal,
  deleteSucursal,
} from '../../../api/sucursales'
import { getEmpresas, getEmpresa } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { SucursalForm, type SucursalFormHandle } from '../components/SucursalForm'
import type { Sucursal, Empresa } from '../../../types'
import type { ColumnDef } from '../../../types/table'

export function Sucursales() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<SucursalFormHandle>(null)
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const empresaNombre = useMemo(
    () => (id: number) => empresas.find((e) => e.id === id)?.nombre || '-',
    [empresas],
  )

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
      key: 'telefono',
      label: 'Teléfono',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'empresaId',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: empresas.map((e) => ({ label: e.nombre, value: String(e.id) })),
      render: (v) => <span className="text-gray-500">{empresaNombre(v)}</span>,
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

  const load = () => {
    setLoading(true)
    if (isSuperAdmin) {
      Promise.all([getSucursales(), getEmpresas()])
        .then(([sucs, emps]) => {
          setSucursales(sucs)
          setEmpresas(emps)
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (isAdminEmpresa && user?.empresaId) {
      Promise.all([getSucursalesByEmpresa(user.empresaId), getEmpresas()])
        .then(([sucs, emps]) => {
          setSucursales(sucs)
          setEmpresas(emps.filter((e) => e.id === user.empresaId))
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (user?.empresaId) {
      const promises: Promise<any>[] = [getEmpresa(user.empresaId)]
      if (user?.sucursalId) {
        promises.push(getSucursal(user.sucursalId).then((s) => [s]))
      } else {
        promises.push(Promise.resolve([]))
      }
      Promise.all(promises)
        .then(([emp, sucs]) => {
          setEmpresas([emp])
          setSucursales(sucs)
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (suc: Sucursal) => {
    setEditing(suc)
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
    if (!confirm('¿Eliminar esta sucursal?')) return
    try {
      await deleteSucursal(id)
      toast.success('Sucursal eliminada')
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const sucursalData = editing
    ? {
        id: editing.id,
        nombre: editing.nombre,
        direccion: editing.direccion || '',
        telefono: editing.telefono || '',
        empresaId: editing.empresaId,
      }
    : undefined

  return (
    <div>
      <PageHeader title="Sucursales" description="Gestión de sucursales">
        {canManage && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva sucursal
          </button>
        )}
      </PageHeader>

      <DataTable
        data={sucursales}
        columns={columns}
        loading={loading}
        rowKey={(s) => s.id}
        onRowClick={(s) => navigate(`/sucursales/${s.id}`)}
        emptyMessage="No hay sucursales registradas"
        actions={(suc) => (
          <>
            <button
              onClick={() => openEdit(suc)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Editar
            </button>
            {(isSuperAdmin || isAdminEmpresa) && (
              <button
                onClick={() => handleDelete(suc.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Eliminar
              </button>
            )}
          </>
        )}
      />

      {showModal && (
        <Modal
          title={editing ? 'Editar sucursal' : 'Nueva sucursal'}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={saving}
        >
          <SucursalForm
            ref={formRef}
            sucursal={sucursalData}
            empresas={empresas}
            isSuperAdmin={isSuperAdmin ?? false}
            defaultEmpresaId={user?.empresaId || 0}
            onSaved={() => {}}
          />
        </Modal>
      )}
    </div>
  )
}

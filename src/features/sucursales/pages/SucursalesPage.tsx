import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSucursalesPage, useSucursalesByEmpresa, useSucursal, useDeleteSucursal } from '../hooks/useSucursales'
import { useEmpresas, useEmpresa } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { SucursalForm } from '../components/SucursalForm'
import type { Sucursal } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SucursalesPage.module.css'

export function Sucursales() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const { data: pageData, isLoading: loadingAll } = useSucursalesPage(page, pageSize)
  const { data: sucursalesByEmpresa = [], isLoading: loadingByEmp } = useSucursalesByEmpresa(isAdminEmpresa ? user!.empresaId! : 0)
  const { data: singleSucursal, isLoading: loadingSingle } = useSucursal(isAdminSucursal ? user!.sucursalId! : 0)
  const { data: empresas = [] } = useEmpresas()
  const { data: singleEmpresa } = useEmpresa(!isSuperAdmin && !isAdminEmpresa && user?.empresaId ? user.empresaId : 0)

  let sucursales: Sucursal[] = []
  let loading = false
  if (isSuperAdmin) {
    sucursales = pageData?.content ?? []
    loading = loadingAll
  } else if (isAdminEmpresa) {
    sucursales = sucursalesByEmpresa
    loading = loadingByEmp
  } else if (isAdminSucursal && singleSucursal) {
    sucursales = [singleSucursal]
    loading = loadingSingle
  }

  const filteredEmpresas = isSuperAdmin
    ? empresas
    : isAdminEmpresa
      ? empresas.filter((e) => e.id === user?.empresaId)
      : singleEmpresa
        ? [singleEmpresa]
        : []

  const empresaNombre = (id: number) => filteredEmpresas.find((e) => e.id === id)?.nombre || '-'

  const columns: ColumnDef<Sucursal>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/sucursales/${row.id}`)}>
          {v}
        </span>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'empresaId',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: filteredEmpresas.map((e) => ({ label: e.nombre, value: String(e.id) })),
      render: (v) => <span className={styles.cellMuted}>{empresaNombre(v)}</span>,
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v) => (
        <div className={styles.badgeCenter}>
          <Badge variant={v ? 'success' : 'danger'}>
            {v ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ),
    },
  ]

  const deleteMutation = useDeleteSucursal()

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (suc: Sucursal) => {
    setEditing(suc)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta sucursal?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Sucursal eliminada')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const editingSucursalData = editing
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
            className={styles.createBtn}
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
        pagination={isSuperAdmin && pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        emptyMessage="No hay sucursales registradas"
        actions={(suc) => (
          <>
            <button
              onClick={() => openEdit(suc)}
              className={styles.editBtn}
            >
              Editar
            </button>
            {(isSuperAdmin || isAdminEmpresa) && (
              <button
                onClick={() => handleDelete(suc.id)}
                className={styles.deleteBtn}
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
        >
          <SucursalForm
            sucursal={editingSucursalData}
            empresas={filteredEmpresas}
            isSuperAdmin={isSuperAdmin ?? false}
            defaultEmpresaId={user?.empresaId || 0}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

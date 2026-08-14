import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSucursalesPage, useDeleteSucursal, useRestaurarSucursal } from '../hooks/useSucursales'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { EstadoBadge } from '../../../shared/components/ui/EstadoBadge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { RestoreButton } from '../../../shared/components/ui/RestoreButton'
import { SucursalForm } from '../components/SucursalForm'
import type { Sucursal, SucursalSummaryResponse } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SucursalesPage.module.css'

export function Sucursales() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sucursal | SucursalSummaryResponse | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const { data: pageData, isLoading: loadingAll } = useSucursalesPage(page, pageSize, filters)
  const { data: empresas = [] } = useEmpresas()

  const sucursales: Array<Sucursal | SucursalSummaryResponse> = pageData?.content ?? []
  const loading = loadingAll

  const filteredEmpresas = empresas.filter((e) => !e.eliminado)

  const empresaNombre = (id: number) => filteredEmpresas.find((e) => e.id === id)?.nombre || '-'

  const columns: ColumnDef<Sucursal | SucursalSummaryResponse>[] = [
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
      key: 'empresa',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: filteredEmpresas.map((e) => ({ label: e.nombre, value: e.nombre })),
      getValue: (row) => empresaNombre(row.empresaId),
      render: (v, row) =>
        row.empresaId ? (
          <span
            className="cursor-pointer hover:text-indigo-600 font-medium"
            onClick={() => navigate(`/empresas/${row.empresaId}`)}
          >
            {v || '-'}
          </span>
        ) : (
          <span className={styles.cellMuted}>{v || '-'}</span>
        ),
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v, row) => (
        <div className={styles.badgeCenter}>
          <EstadoBadge eliminado={row.eliminado} activo={v} />
        </div>
      ),
    },
  ]

  const deleteMutation = useDeleteSucursal()
  const restoreMutation = useRestaurarSucursal()

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (suc: Sucursal | SucursalSummaryResponse) => {
    setEditing(suc)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta sucursal? También se eliminarán sus cámaras, sensores y usuarios.')) return
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
        pagination={pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay sucursales registradas"
        rowClassName={(suc) => (suc.eliminado ? 'opacity-60' : undefined)}
        actions={(suc) => (
          <>
            {suc.eliminado ? (
              isSuperAdmin && (
                <RestoreButton
                  onRestore={() => restoreMutation.mutateAsync(suc.id)}
                  confirmMessage="¿Restaurar esta sucursal?"
                  successMessage="Sucursal restaurada"
                />
              )
            ) : (
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

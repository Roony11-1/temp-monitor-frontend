import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEmpresa, useDeleteEmpresa, useEmpresasPage, useRestaurarEmpresa } from '../hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { EstadoBadge } from '../../../shared/components/ui/EstadoBadge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { RestoreButton } from '../../../shared/components/ui/RestoreButton'
import { EmpresaForm } from '../components/EmpresaForm'
import type { Empresa } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './EmpresasPage.module.css'

export function Empresas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')
  const canDelete = isSuperAdmin

  const { data: pageData, isLoading: loadingAll } = useEmpresasPage(page, pageSize, filters)
  const { data: singleEmpresa, isLoading: loadingSingle } = useEmpresa(user?.empresaId ?? 0)
  const deleteMutation = useDeleteEmpresa()
  const restoreMutation = useRestaurarEmpresa()

  const empresas = isSuperAdmin ? (pageData?.content ?? []) : singleEmpresa ? [singleEmpresa] : []
  const loading = isSuperAdmin ? loadingAll : loadingSingle

  const columns: ColumnDef<Empresa>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/empresas/${row.id}`)}>
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
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
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

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (emp: Empresa) => {
    setEditing(emp)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Empresa eliminada')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const editingEmpresaData = editing
    ? { id: editing.id, nombre: editing.nombre, direccion: editing.direccion || '', telefono: editing.telefono || '', email: editing.email || '' }
    : undefined

  return (
    <div>
      <PageHeader title="Empresas" description="Gestión de empresas">
        {isSuperAdmin && (
          <button
            onClick={openCreate}
            className={styles.createBtn}
          >
            + Nueva empresa
          </button>
        )}
      </PageHeader>

      <DataTable
        data={empresas}
        columns={columns}
        loading={loading}
        rowKey={(e) => e.id}
        pagination={isSuperAdmin && pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay empresas registradas"
        rowClassName={(emp) => (emp.eliminado ? 'opacity-60' : undefined)}
        actions={(emp) =>
          canEdit || canDelete ? (
            <>
              {emp.eliminado ? (
                isSuperAdmin && (
                  <RestoreButton
                    onRestore={() => restoreMutation.mutateAsync(emp.id)}
                    confirmMessage="¿Restaurar esta empresa?"
                    successMessage="Empresa restaurada"
                  />
                )
              ) : (
                <>
                  {canEdit && (
                    <button
                      onClick={() => openEdit(emp)}
                      className={styles.editBtn}
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className={styles.deleteBtn}
                    >
                      Eliminar
                    </button>
                  )}
                </>
              )}
            </>
          ) : undefined
        }
      />

      {showModal && (
        <Modal
          title={editing ? 'Editar empresa' : 'Nueva empresa'}
          onClose={() => setShowModal(false)}
        >
          <EmpresaForm
            empresa={editingEmpresaData}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteUsuario, useUsuariosPage, useUsuario, useRestaurarUsuario } from '../hooks/useUsuarios'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { EstadoBadge } from '../../../shared/components/ui/EstadoBadge'
import { RolBadge } from '../../../shared/components/ui/RolBadge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { RestoreButton } from '../../../shared/components/ui/RestoreButton'
import { UsuarioForm } from '../components/UsuarioForm'
import type { UsuarioSummaryResponse } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './UsuariosPage.module.css'

const ROL_FILTER_OPTIONS = [
  { label: 'Admin Global', value: 'SUPER_ADMIN' },
  { label: 'Admin Empresa', value: 'ADMIN_EMPRESA' },
  { label: 'Admin Sucursal', value: 'ADMIN_SUCURSAL' },
  { label: 'Usuario', value: 'USUARIO' },
]

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<UsuarioSummaryResponse | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !isSuperAdmin && !isAdminEmpresa

  const rolFilterOptions = isSuperAdmin
    ? ROL_FILTER_OPTIONS
    : ROL_FILTER_OPTIONS.filter((o) => o.value !== 'SUPER_ADMIN')

  const { data: empresas = [] } = useEmpresas()
  const { data: pageData, isLoading: loadingPage } = useUsuariosPage(page, pageSize, filters)
  const { data: editingDetail } = useUsuario(editing?.id ?? 0)

  const usuarios: UsuarioSummaryResponse[] = pageData?.content ?? []
  const loading = loadingPage

  const filteredEmpresas = empresas.filter((e) => !e.eliminado)

  const deleteMutation = useDeleteUsuario()
  const restoreMutation = useRestaurarUsuario()

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (usr: UsuarioSummaryResponse) => {
    setEditing(usr)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Usuario eliminado')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const columns: ColumnDef<UsuarioSummaryResponse>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/usuarios/${row.id}`)}>
          {v}
        </span>
      ),
    },
    {
      key: 'empresa',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      render: (v, row) =>
        row.empresaId ? (
          <span className="cursor-pointer hover:text-indigo-600 font-medium" onClick={() => navigate(`/empresas/${row.empresaId}`)}>
            {v || '-'}
          </span>
        ) : (
          <span className={styles.cellMuted}>{v || '-'}</span>
        ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      render: (v, row) =>
        row.sucursalId ? (
          <span className="cursor-pointer hover:text-indigo-600 font-medium" onClick={() => navigate(`/sucursales/${row.sucursalId}`)}>
            {v || '-'}
          </span>
        ) : (
          <span className={styles.cellMuted}>{v || '-'}</span>
        ),
    },
    {
      key: 'roles',
      label: 'Rol',
      filterable: true,
      filterType: 'select',
      filterOptions: rolFilterOptions,
      render: (_, row) => (
        <div className={styles.roleList}>
          {row.roles.map((rol) => (
            <RolBadge key={rol} rol={rol} />
          ))}
        </div>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v, row) => <EstadoBadge eliminado={row.eliminado} activo={v} />,
    },
  ]

  const editingUsuarioData = editingDetail
    ? {
        id: editingDetail.id,
        email: editingDetail.email,
        nombre: editingDetail.nombre || '',
        telefono: editingDetail.telefono || '',
        empresaId: editingDetail.empresaId,
        sucursalId: editingDetail.sucursalId,
        roles: editingDetail.roles,
      }
    : undefined

  return (
    <div>
      <PageHeader title="Usuarios" description="Gestión de usuarios">
        {canManage && (
          <button
            onClick={openCreate}
            className={styles.createBtn}
          >
            + Nuevo usuario
          </button>
        )}
      </PageHeader>

      <DataTable
        data={usuarios}
        columns={columns as ColumnDef<UsuarioSummaryResponse>[]}
        loading={loading}
        rowKey={(u) => u.id}
        pagination={pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay usuarios registrados"
        rowClassName={(usr) => (usr.eliminado ? 'opacity-60' : undefined)}
        actions={(usr) => (
          <>
            {usr.eliminado ? (
              isSuperAdmin && (
                <RestoreButton
                  onRestore={() => restoreMutation.mutateAsync(usr.id)}
                  confirmMessage="¿Restaurar este usuario?"
                  successMessage="Usuario restaurado"
                />
              )
            ) : (
              canManage && (
                <>
                  <button
                    onClick={() => openEdit(usr)}
                    className={styles.editBtn}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usr.id)}
                    className={styles.deleteBtn}
                  >
                    Eliminar
                  </button>
                </>
              )
            )}
          </>
        )}
      />

      {showModal && (
        <Modal
          title={editing ? 'Editar usuario' : 'Nuevo usuario'}
          onClose={() => setShowModal(false)}
        >
          <UsuarioForm
            usuario={editingUsuarioData}
            empresas={filteredEmpresas}
            canManage={canManage ?? false}
            isReadOnly={isReadOnly ?? false}
            defaultEmpresaId={currentUser?.empresaId || null}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

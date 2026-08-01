import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsuariosByEmpresa, useUsuariosBySucursal, useDeleteUsuario, useUsuariosPage } from '../hooks/useUsuarios'
import { useEmpresas, useEmpresa } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { UsuarioForm } from '../components/UsuarioForm'
import type { Usuario } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './UsuariosPage.module.css'

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !isSuperAdmin && !isAdminEmpresa

  const empresaId = currentUser?.empresaId
  const sucursalId = currentUser?.sucursalId

  const { data: empresas = [] } = useEmpresas()
  const { data: empresaData } = useEmpresa(!isSuperAdmin && !isAdminEmpresa ? empresaId! : 0)
  const { data: pageData, isLoading: loadingPage } = useUsuariosPage(page, pageSize, filters)
  const { data: usuariosEmpresa = [], isLoading: loadingEmpresa } = useUsuariosByEmpresa(isAdminEmpresa ? empresaId! : 0)
  const { data: usuariosSucursal = [], isLoading: loadingSucursal } = useUsuariosBySucursal(!isSuperAdmin && !isAdminEmpresa ? sucursalId! : 0)

  const usuarios = isSuperAdmin ? (pageData?.content ?? []) : isAdminEmpresa ? usuariosEmpresa : usuariosSucursal
  const loading = isSuperAdmin ? loadingPage : isAdminEmpresa ? loadingEmpresa : loadingSucursal

  const filteredEmpresas = isSuperAdmin
    ? empresas
    : isAdminEmpresa
      ? empresas.filter((e) => e.id === currentUser?.empresaId)
      : empresaData
        ? [empresaData]
        : []

  const deleteMutation = useDeleteUsuario()

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (usr: Usuario) => {
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

  const columns: ColumnDef<Usuario>[] = [
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
    { key: 'nombre', label: 'Nombre', sortable: true, filterable: true },
    { key: 'empresa', label: 'Empresa', sortable: true, filterable: true, render: (v) => v || '-' },
    { key: 'sucursal', label: 'Sucursal', sortable: true, filterable: true, render: (v) => v || '-' },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Activo' : 'Inactivo'}</Badge>,
    },
  ]

  const editingUsuarioData = editing
    ? {
        id: editing.id,
        email: editing.email,
        nombre: editing.nombre || '',
        telefono: editing.telefono || '',
        empresaId: editing.empresaId,
        sucursalId: editing.sucursalId,
        roles: editing.roles,
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
        columns={columns as ColumnDef<Usuario>[]}
        loading={loading}
        rowKey={(u) => u.id}
        pagination={isSuperAdmin && pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay usuarios registrados"
        actions={(usr) => (
          <>
            {canManage && (
              <button
                onClick={() => openEdit(usr)}
                className={styles.editBtn}
              >
                Editar
              </button>
            )}
            {canManage && (
              <button
                onClick={() => handleDelete(usr.id)}
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

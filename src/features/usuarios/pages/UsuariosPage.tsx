import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getUsuarios,
  getUsuariosByEmpresa,
  getUsuariosBySucursal,
  deleteUsuario,
} from '../../../api/usuarios'
import { getEmpresas, getEmpresa } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { UsuarioForm, type UsuarioFormHandle } from '../components/UsuarioForm'
import type { Usuario, Empresa, Rol } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './UsuariosPage.module.css'

const rolesDisponibles: Rol[] = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_SUCURSAL', 'TECNICO', 'USUARIO']

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<UsuarioFormHandle>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !isSuperAdmin && !isAdminEmpresa

  const empresaNombre = useMemo(
    () => (id: number | null) => (id ? empresas.find((e) => e.id === id)?.nombre || '-' : '-'),
    [empresas],
  )

  const columns: ColumnDef<Usuario>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellName}>{v}</span>,
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterOptions: rolesDisponibles.map((r) => ({ label: r, value: r })),
      render: (v: Rol[]) => (
        <div className={styles.roleList}>
          {v.map((rol) => (
            <Badge key={rol} variant="info" size="sm">
              {rol}
            </Badge>
          ))}
        </div>
      ),
      getValue: (row) => row.roles.join(', '),
    },
    ...(!isReadOnly
      ? [
          {
            key: 'empresaId' as const,
            label: 'Empresa' as const,
            sortable: true,
            filterable: true,
            filterType: 'select' as const,
            filterOptions: empresas.map((e) => ({ label: e.nombre, value: String(e.id) })),
            render: (v: number | null) => (
              <span className={styles.cellMuted}>{empresaNombre(v)}</span>
            ),
          },
        ]
      : []),
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

  const load = () => {
    setLoading(true)
    if (isSuperAdmin) {
      Promise.all([getUsuarios(), getEmpresas()])
        .then(([usrs, emps]) => {
          setUsuarios(usrs)
          setEmpresas(emps)
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (isAdminEmpresa && currentUser?.empresaId) {
      Promise.all([getUsuariosByEmpresa(currentUser.empresaId), getEmpresas()])
        .then(([usrs, emps]) => {
          setUsuarios(usrs)
          setEmpresas(emps.filter((e) => e.id === currentUser.empresaId))
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (currentUser?.sucursalId) {
      Promise.all([getUsuariosBySucursal(currentUser.sucursalId), getEmpresa(currentUser.empresaId!)])
        .then(([usrs, emp]) => {
          setUsuarios(usrs)
          setEmpresas([emp])
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

  const openEdit = (usr: Usuario) => {
    setEditing(usr)
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
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUsuario(id)
      toast.success('Usuario eliminado')
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const usuarioData = editing
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
        onRowClick={(u) => navigate(`/usuarios/${u.id}`)}
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
          onSave={handleSave}
          isSaving={saving}
        >
          <UsuarioForm
            ref={formRef}
            usuario={usuarioData}
            empresas={empresas}
            canManage={canManage ?? false}
            isReadOnly={isReadOnly ?? false}
            defaultEmpresaId={currentUser?.empresaId || null}
            onSaved={() => {}}
          />
        </Modal>
      )}

    </div>
  )
}

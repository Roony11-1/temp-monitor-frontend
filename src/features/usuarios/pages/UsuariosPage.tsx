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
import { PasswordForm, type PasswordFormHandle } from '../components/PasswordForm'
import type { Usuario, Empresa, Rol } from '../../../types'
import type { ColumnDef } from '../../../types/table'

const rolesDisponibles: Rol[] = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_SUCURSAL', 'TECNICO', 'USUARIO']

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<UsuarioFormHandle>(null)
  const passwordRef = useRef<PasswordFormHandle>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null)
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
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: false,
      filterable: true,
      filterType: 'select',
      filterOptions: rolesDisponibles.map((r) => ({ label: r, value: r })),
      render: (v: Rol[]) => (
        <div className="flex gap-1 flex-wrap">
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
              <span className="text-gray-500">{empresaNombre(v)}</span>
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

  const handleChangePassword = async () => {
    if (!passwordUserId) return
    setSaving(true)
    try {
      await passwordRef.current?.submit()
      setShowPasswordModal(false)
      setPasswordUserId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al cambiar contraseña'))
    } finally {
      setSaving(false)
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
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Editar
              </button>
            )}
            {(canManage || usr.id === currentUser?.id) && (
              <button
                onClick={() => {
                  setPasswordUserId(usr.id)
                  setShowPasswordModal(true)
                }}
                className="text-amber-600 hover:text-amber-800 text-sm font-medium"
              >
                Password
              </button>
            )}
            {canManage && (
              <button
                onClick={() => handleDelete(usr.id)}
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

      {showPasswordModal && (
        <Modal
          title="Cambiar contraseña"
          onClose={() => {
            setShowPasswordModal(false)
            setPasswordUserId(null)
          }}
          onSave={handleChangePassword}
          isSaving={saving}
        >
          {passwordUserId && (
            <PasswordForm ref={passwordRef} userId={passwordUserId} onSaved={() => {}} />
          )}
        </Modal>
      )}
    </div>
  )
}

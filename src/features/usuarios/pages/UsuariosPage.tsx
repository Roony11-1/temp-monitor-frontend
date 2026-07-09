import { useEffect, useState, useMemo } from 'react'
import {
  getUsuarios,
  getUsuariosByEmpresa,
  getUsuariosBySucursal,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  cambiarPassword,
} from '../../../api/usuarios'
import { getEmpresas, getEmpresa } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import type { Usuario, UsuarioRequest, Empresa, Rol } from '../../../types'
import type { ColumnDef } from '../../../types/table'

const rolesDisponibles: Rol[] = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_SUCURSAL', 'TECNICO', 'USUARIO']

export function Usuarios() {
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<UsuarioRequest>({
    email: '',
    password: '',
    nombre: '',
    telefono: '',
    empresaId: null,
    sucursalId: null,
    roles: ['USUARIO'],
  })

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !isSuperAdmin && !isAdminEmpresa

  const empresaNombre = useMemo(
    () => (id: number | null) => (id ? empresas.find((e) => e.id === id)?.nombre || '-' : '-'),
    [empresas]
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
    setForm({
      email: '',
      password: '',
      nombre: '',
      telefono: '',
      empresaId: currentUser?.empresaId || null,
      sucursalId: null,
      roles: ['USUARIO'],
    })
    setShowModal(true)
  }

  const openEdit = (usr: Usuario) => {
    setEditing(usr)
    setForm({
      email: usr.email,
      password: '',
      nombre: usr.nombre || '',
      telefono: usr.telefono || '',
      empresaId: usr.empresaId,
      sucursalId: usr.sucursalId,
      roles: usr.roles,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateUsuario(editing.id, {
          email: form.email,
          nombre: form.nombre,
          telefono: form.telefono,
          empresaId: form.empresaId,
          sucursalId: form.sucursalId,
          roles: form.roles,
        })
        toast.success('Usuario actualizado')
      } else {
        await createUsuario(form)
        toast.success('Usuario creado')
      }
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
    if (!passwordUserId || !nuevaPassword) return
    setSaving(true)
    try {
      await cambiarPassword(passwordUserId, nuevaPassword)
      toast.success('Contraseña actualizada')
      setShowPasswordModal(false)
      setNuevaPassword('')
      setPasswordUserId(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al cambiar contraseña'))
    } finally {
      setSaving(false)
    }
  }

  const toggleRol = (rol: Rol) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(rol)
        ? prev.roles.filter((r) => r !== rol)
        : [...prev.roles, rol],
    }))
  }

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
                  setNuevaPassword('')
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            {!isReadOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <select
                  value={form.empresaId ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, empresaId: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="">Sin empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {canManage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="flex flex-wrap gap-3">
                  {rolesDisponibles.map((rol) => (
                    <label key={rol} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.roles.includes(rol)}
                        onChange={() => toggleRol(rol)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{rol}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal
          title="Cambiar contraseña"
          onClose={() => {
            setShowPasswordModal(false)
            setPasswordUserId(null)
            setNuevaPassword('')
          }}
          onSave={handleChangePassword}
          isSaving={saving}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </Modal>
      )}
    </div>
  )
}

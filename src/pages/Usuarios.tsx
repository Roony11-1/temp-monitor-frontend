import { useEffect, useState } from 'react'
import {
  getUsuarios,
  getUsuariosByEmpresa,
  getUsuariosBySucursal,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  activarUsuario,
  desactivarUsuario,
  cambiarPassword,
} from '../api/usuarios'
import { getEmpresas, getEmpresa } from '../api/empresas'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import toast from 'react-hot-toast'
import type { Usuario, UsuarioRequest, Empresa, Rol } from '../types'

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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar')
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
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleActivo = async (usr: Usuario) => {
    if (!canManage) return
    try {
      if (usr.activo) {
        await desactivarUsuario(usr.id)
        toast.success('Usuario desactivado')
      } else {
        await activarUsuario(usr.id)
        toast.success('Usuario activado')
      }
      load()
    } catch {
      toast.error('Error al cambiar estado')
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
    } catch {
      toast.error('Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  const empresaNombre = (id: number | null) =>
    id ? empresas.find((e) => e.id === id)?.nombre || '-' : '-'

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de usuarios</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nuevo usuario
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay usuarios registrados</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium">Roles</th>
                {!isReadOnly && <th className="text-left px-6 py-3 font-medium">Empresa</th>}
                <th className="text-center px-6 py-3 font-medium">Estado</th>
                <th className="text-right px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((usr) => (
                <tr key={usr.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{usr.email}</td>
                  <td className="px-6 py-4 text-gray-500">{usr.nombre || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {usr.roles.map((rol) => (
                        <span
                          key={rol}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                        >
                          {rol}
                        </span>
                      ))}
                    </div>
                  </td>
                  {!isReadOnly && (
                    <td className="px-6 py-4 text-gray-500">{empresaNombre(usr.empresaId)}</td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActivo(usr)}
                      disabled={!canManage}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        usr.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {usr.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {(canManage || usr.id === currentUser?.id) && (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

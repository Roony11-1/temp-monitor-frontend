import { useEffect, useState } from 'react'
import {
  getEmpresas,
  getEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  activarEmpresa,
  desactivarEmpresa,
} from '../api/empresas'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import toast from 'react-hot-toast'
import type { Empresa, EmpresaRequest } from '../types'

export function Empresas() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EmpresaRequest>({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
  })

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')
  const canDelete = isSuperAdmin

  const load = () => {
    setLoading(true)
    if (isSuperAdmin) {
      getEmpresas()
        .then(setEmpresas)
        .catch(() => toast.error('Error al cargar empresas'))
        .finally(() => setLoading(false))
    } else if (user?.empresaId) {
      getEmpresa(user.empresaId)
        .then((emp) => setEmpresas([emp]))
        .catch(() => toast.error('Error al cargar empresa'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: '', direccion: '', telefono: '', email: '' })
    setShowModal(true)
  }

  const openEdit = (emp: Empresa) => {
    setEditing(emp)
    setForm({
      nombre: emp.nombre,
      direccion: emp.direccion || '',
      telefono: emp.telefono || '',
      email: emp.email || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateEmpresa(editing.id, form)
        toast.success('Empresa actualizada')
      } else {
        await createEmpresa(form)
        toast.success('Empresa creada')
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
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await deleteEmpresa(id)
      toast.success('Empresa eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleActivo = async (emp: Empresa) => {
    if (!isSuperAdmin) return
    try {
      if (emp.activo) {
        await desactivarEmpresa(emp.id)
        toast.success('Empresa desactivada')
      } else {
        await activarEmpresa(emp.id)
        toast.success('Empresa activada')
      }
      load()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de empresas</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva empresa
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : empresas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay empresas registradas</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium">Dirección</th>
                <th className="text-left px-6 py-3 font-medium">Teléfono</th>
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-center px-6 py-3 font-medium">Estado</th>
                {(canEdit || canDelete) && <th className="text-right px-6 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {empresas.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{emp.direccion || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{emp.telefono || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{emp.email || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActivo(emp)}
                      disabled={!isSuperAdmin}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  {canEdit || canDelete ? (
                    <td className="px-6 py-4 text-right space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(emp)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Editar empresa' : 'Nueva empresa'}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

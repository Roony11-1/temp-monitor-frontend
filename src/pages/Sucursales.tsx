import { useEffect, useState } from 'react'
import {
  getSucursales,
  getSucursalesByEmpresa,
  getSucursal,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  activarSucursal,
  desactivarSucursal,
} from '../api/sucursales'
import { getEmpresas, getEmpresa } from '../api/empresas'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import toast from 'react-hot-toast'
import type { Sucursal, SucursalRequest, Empresa } from '../types'

export function Sucursales() {
  const { user } = useAuth()
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SucursalRequest>({
    nombre: '',
    direccion: '',
    telefono: '',
    empresaId: 0,
  })

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const load = () => {
    setLoading(true)
    if (isSuperAdmin) {
      Promise.all([getSucursales(), getEmpresas()])
        .then(([sucs, emps]) => {
          setSucursales(sucs)
          setEmpresas(emps)
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (isAdminEmpresa && user?.empresaId) {
      Promise.all([getSucursalesByEmpresa(user.empresaId), getEmpresas()])
        .then(([sucs, emps]) => {
          setSucursales(sucs)
          setEmpresas(emps.filter((e) => e.id === user.empresaId))
        })
        .catch(() => toast.error('Error al cargar datos'))
        .finally(() => setLoading(false))
    } else if (user?.empresaId) {
      const promises: Promise<any>[] = [getEmpresa(user.empresaId)]
      if (user?.sucursalId) {
        promises.push(getSucursal(user.sucursalId).then((s) => [s]))
      } else {
        promises.push(Promise.resolve([]))
      }
      Promise.all(promises)
        .then(([emp, sucs]) => {
          setEmpresas([emp])
          setSucursales(sucs)
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
      nombre: '',
      direccion: '',
      telefono: '',
      empresaId: user?.empresaId || 0,
    })
    setShowModal(true)
  }

  const openEdit = (suc: Sucursal) => {
    setEditing(suc)
    setForm({
      nombre: suc.nombre,
      direccion: suc.direccion || '',
      telefono: suc.telefono || '',
      empresaId: suc.empresaId,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateSucursal(editing.id, form)
        toast.success('Sucursal actualizada')
      } else {
        await createSucursal(form)
        toast.success('Sucursal creada')
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
    if (!confirm('¿Eliminar esta sucursal?')) return
    try {
      await deleteSucursal(id)
      toast.success('Sucursal eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleActivo = async (suc: Sucursal) => {
    if (!isSuperAdmin && !isAdminEmpresa) return
    try {
      if (suc.activo) {
        await desactivarSucursal(suc.id)
        toast.success('Sucursal desactivada')
      } else {
        await activarSucursal(suc.id)
        toast.success('Sucursal activada')
      }
      load()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const empresaNombre = (id: number) => empresas.find((e) => e.id === id)?.nombre || '-'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de sucursales</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva sucursal
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : sucursales.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay sucursales registradas</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium">Dirección</th>
                <th className="text-left px-6 py-3 font-medium">Teléfono</th>
                <th className="text-left px-6 py-3 font-medium">Empresa</th>
                <th className="text-center px-6 py-3 font-medium">Estado</th>
                {canManage && <th className="text-right px-6 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {sucursales.map((suc) => (
                <tr key={suc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{suc.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{suc.direccion || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{suc.telefono || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{empresaNombre(suc.empresaId)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActivo(suc)}
                      disabled={!isSuperAdmin && !isAdminEmpresa}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        suc.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {suc.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(suc)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      {(isSuperAdmin || isAdminEmpresa) && (
                        <button
                          onClick={() => handleDelete(suc.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? 'Editar sucursal' : 'Nueva sucursal'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                value={form.empresaId}
                onChange={(e) => setForm({ ...form, empresaId: Number(e.target.value) })}
                required
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value={0}>Seleccione una empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import {
  getCamaras,
  getCamarasBySucursal,
  createCamara,
  updateCamara,
  deleteCamara,
  activarCamara,
  desactivarCamara,
} from '../api/camaras'
import { getSucursales, getSucursalesByEmpresa, getSucursal } from '../api/sucursales'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import toast from 'react-hot-toast'
import type { Camara, CamaraRequest, Sucursal } from '../types'

export function Camaras() {
  const { user } = useAuth()
  const [camaras, setCamaras] = useState<Camara[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Camara | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CamaraRequest>({
    nombre: '',
    descripcion: '',
    sucursalId: 0,
    temperaturaMinima: null,
    temperaturaMaxima: null,
  })

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const loadSucursales = () => {
    if (isSuperAdmin) {
      return getSucursales()
    } else if (isAdminEmpresa && user?.empresaId) {
      return getSucursalesByEmpresa(user.empresaId)
    } else if (user?.sucursalId) {
      return getSucursal(user.sucursalId).then((s) => [s])
    }
    return Promise.resolve([])
  }

  const loadCamaras = () => {
    if (isSuperAdmin) {
      return getCamaras()
    } else if (user?.sucursalId) {
      return getCamarasBySucursal(user.sucursalId)
    } else if (isAdminEmpresa) {
      return getCamaras()
    }
    return Promise.resolve([])
  }

  const load = () => {
    setLoading(true)
    Promise.all([loadCamaras(), loadSucursales()])
      .then(([cams, sucs]) => {
        if (!isSuperAdmin && isAdminEmpresa && user?.empresaId) {
          const empresaSucIds = sucs.map((s) => s.id)
          setCamaras(cams.filter((c) => empresaSucIds.includes(c.sucursalId)))
        } else {
          setCamaras(cams)
        }
        setSucursales(sucs)
      })
      .catch(() => toast.error('Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({
      nombre: '',
      descripcion: '',
      sucursalId: user?.sucursalId || (sucursales.length === 1 ? sucursales[0].id : 0),
      temperaturaMinima: null,
      temperaturaMaxima: null,
    })
    setShowModal(true)
  }

  const openEdit = (cam: Camara) => {
    setEditing(cam)
    setForm({
      nombre: cam.nombre,
      descripcion: cam.descripcion || '',
      sucursalId: cam.sucursalId,
      temperaturaMinima: cam.temperaturaMinima,
      temperaturaMaxima: cam.temperaturaMaxima,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateCamara(editing.id, form)
        toast.success('Cámara actualizada')
      } else {
        await createCamara(form)
        toast.success('Cámara creada')
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
    if (!confirm('¿Eliminar esta cámara?')) return
    try {
      await deleteCamara(id)
      toast.success('Cámara eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const toggleActivo = async (cam: Camara) => {
    if (!canManage) return
    try {
      if (cam.activo) {
        await desactivarCamara(cam.id)
        toast.success('Cámara desactivada')
      } else {
        await activarCamara(cam.id)
        toast.success('Cámara activada')
      }
      load()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const sucursalNombre = (id: number) => sucursales.find((s) => s.id === id)?.nombre || '-'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cámaras</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de cámaras de temperatura</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Nueva cámara
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : camaras.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay cámaras registradas</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Nombre</th>
                <th className="text-left px-6 py-3 font-medium">Descripción</th>
                <th className="text-left px-6 py-3 font-medium">Sucursal</th>
                <th className="text-center px-6 py-3 font-medium">Temp. Mín</th>
                <th className="text-center px-6 py-3 font-medium">Temp. Máx</th>
                <th className="text-center px-6 py-3 font-medium">Estado</th>
                {canManage && <th className="text-right px-6 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {camaras.map((cam) => (
                <tr key={cam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{cam.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{cam.descripcion || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{sucursalNombre(cam.sucursalId)}</td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {cam.temperaturaMinima != null ? `${cam.temperaturaMinima}°C` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {cam.temperaturaMaxima != null ? `${cam.temperaturaMaxima}°C` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActivo(cam)}
                      disabled={!canManage}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        cam.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {cam.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(cam)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cam.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
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
          title={editing ? 'Editar cámara' : 'Nueva cámara'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
              <select
                value={form.sucursalId}
                onChange={(e) => setForm({ ...form, sucursalId: Number(e.target.value) })}
                required
                disabled={!isSuperAdmin && !isAdminEmpresa}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value={0}>Seleccione una sucursal</option>
                {sucursales.map((suc) => (
                  <option key={suc.id} value={suc.id}>
                    {suc.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura mínima (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperaturaMinima ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, temperaturaMinima: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura máxima (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperaturaMaxima ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, temperaturaMaxima: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

import { useEffect, useState, useMemo } from 'react'
import {
  getCamaras,
  getCamarasBySucursal,
  createCamara,
  updateCamara,
  deleteCamara,
} from '../api/camaras'
import { getSucursales, getSucursalesByEmpresa, getSucursal } from '../api/sucursales'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import toast from 'react-hot-toast'
import type { Camara, CamaraRequest, Sucursal } from '../types'
import type { ColumnDef } from '../types/table'

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

  const sucursalNombre = useMemo(
    () => (id: number) => sucursales.find((s) => s.id === id)?.nombre || '-',
    [sucursales]
  )

  const columns: ColumnDef<Camara>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'sucursalId',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: sucursales.map((s) => ({ label: s.nombre, value: String(s.id) })),
      render: (v) => <span className="text-gray-500">{sucursalNombre(v)}</span>,
    },
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (v) => (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {v ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ),
    },
  ]

  const loadSucursales = async () => {
    if (isSuperAdmin) {
      return getSucursales()
    } else if (isAdminEmpresa && user?.empresaId) {
      return getSucursalesByEmpresa(user.empresaId)
    } else if (user?.sucursalId) {
      const s = await getSucursal(user.sucursalId)
      return [s]
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

      <DataTable
        data={camaras}
        columns={columns}
        loading={loading}
        rowKey={(c) => c.id}
        emptyMessage="No hay cámaras registradas"
        actions={(cam) => (
          <>
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
          </>
        )}
      />

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

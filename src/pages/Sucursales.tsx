import { useEffect, useState, useMemo } from 'react'
import {
  getSucursales,
  getSucursalesByEmpresa,
  getSucursal,
  createSucursal,
  updateSucursal,
  deleteSucursal,
} from '../api/sucursales'
import { getEmpresas, getEmpresa } from '../api/empresas'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import toast from 'react-hot-toast'
import type { Sucursal, SucursalRequest, Empresa } from '../types'
import type { ColumnDef } from '../types/table'

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

  const empresaNombre = useMemo(
    () => (id: number) => empresas.find((e) => e.id === id)?.nombre || '-',
    [empresas]
  )

  const columns: ColumnDef<Sucursal>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'direccion',
      label: 'Dirección',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
    },
    {
      key: 'empresaId',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: empresas.map((e) => ({ label: e.nombre, value: String(e.id) })),
      render: (v) => <span className="text-gray-500">{empresaNombre(v)}</span>,
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

      <DataTable
        data={sucursales}
        columns={columns}
        loading={loading}
        rowKey={(s) => s.id}
        emptyMessage="No hay sucursales registradas"
        actions={(suc) => (
          <>
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
          </>
        )}
      />

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

import { useEffect, useState } from 'react'
import {
  getEmpresas,
  getEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from '../api/empresas'
import { useAuth } from '../contexts/AuthContext'
import { Modal } from '../components/Modal'
import { DataTable } from '../components/DataTable'
import toast from 'react-hot-toast'
import type { Empresa, EmpresaRequest } from '../types'
import type { ColumnDef } from '../types/table'

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

  const columns: ColumnDef<Empresa>[] = [
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
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v) => <span className="text-gray-500">{v || '-'}</span>,
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

      <DataTable
        data={empresas}
        columns={columns}
        loading={loading}
        rowKey={(e) => e.id}
        emptyMessage="No hay empresas registradas"
        actions={(emp) =>
          canEdit || canDelete ? (
            <>
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
            </>
          ) : undefined
        }
      />

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

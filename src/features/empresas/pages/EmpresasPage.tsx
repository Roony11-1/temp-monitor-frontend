import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getEmpresas,
  getEmpresa,
  deleteEmpresa,
} from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { EmpresaForm, type EmpresaFormHandle } from '../components/EmpresaForm'
import type { Empresa } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './EmpresasPage.module.css'

export function Empresas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<EmpresaFormHandle>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')
  const canDelete = isSuperAdmin

  const columns: ColumnDef<Empresa>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellName}>{v}</span>,
    },
    {
      key: 'direccion',
      label: 'Dirección',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
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
    setShowModal(true)
  }

  const openEdit = (emp: Empresa) => {
    setEditing(emp)
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
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await deleteEmpresa(id)
      toast.success('Empresa eliminada')
      load()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const empresaData = editing
    ? { id: editing.id, nombre: editing.nombre, direccion: editing.direccion || '', telefono: editing.telefono || '', email: editing.email || '' }
    : undefined

  return (
    <div>
      <PageHeader title="Empresas" description="Gestión de empresas">
        {isSuperAdmin && (
          <button
            onClick={openCreate}
            className={styles.createBtn}
          >
            + Nueva empresa
          </button>
        )}
      </PageHeader>

      <DataTable
        data={empresas}
        columns={columns}
        loading={loading}
        rowKey={(e) => e.id}
        onRowClick={(e) => navigate(`/empresas/${e.id}`)}
        emptyMessage="No hay empresas registradas"
        actions={(emp) =>
          canEdit || canDelete ? (
            <>
              {canEdit && (
                <button
                  onClick={() => openEdit(emp)}
                  className={styles.editBtn}
                >
                  Editar
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(emp.id)}
                  className={styles.deleteBtn}
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
          <EmpresaForm
            ref={formRef}
            empresa={empresaData}
            onSaved={() => {}}
          />
        </Modal>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamaras, useCamarasBySucursal, useCamarasPage, useDeleteCamara } from '../hooks/useCamaras'
import { useSucursales, useSucursalesByEmpresa, useSucursal } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { CamaraForm } from '../components/CamaraForm'
import type { CamaraSummaryResponse, Sucursal, SucursalSummaryResponse } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './CamarasPage.module.css'

export function Camaras() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CamaraSummaryResponse | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')
  const isAdminSucursal = user?.roles?.includes('ADMIN_SUCURSAL')
  const canManage = isSuperAdmin || isAdminEmpresa || isAdminSucursal

  const { data: pageData, isLoading: loadingPage } = useCamarasPage(page, pageSize, filters)
  const { data: allCamaras = [] } = useCamaras()
  const { data: camarasBySuc = [], isLoading: loadingBySuc } = useCamarasBySucursal(user?.sucursalId ?? 0)
  const { data: allSucursales = [] } = useSucursales()
  const { data: sucursalesByEmp = [] } = useSucursalesByEmpresa(isAdminEmpresa ? user!.empresaId! : 0)
  const { data: singleSucursal } = useSucursal(isAdminSucursal ? user!.sucursalId! : 0)

  let camaras: CamaraSummaryResponse[] = []
  let loading = false
  let sucursales: Array<Sucursal | SucursalSummaryResponse> = []

  const sucursalNombre = (id: number) => sucursales.find((s) => s.id === id)?.nombre || '-'

  if (isSuperAdmin) {
    camaras = pageData?.content ?? []
    loading = loadingPage
    sucursales = allSucursales
  } else if (isAdminEmpresa) {
    camaras = allCamaras
    sucursales = sucursalesByEmp
    loading = loadingBySuc
    if (sucursales.length) {
      const sucursalNombres = new Set(sucursales.map((s) => s.nombre))
      camaras = allCamaras.filter((c) => sucursalNombres.has(c.sucursal))
    }
  } else if (isAdminSucursal) {
    sucursales = singleSucursal ? [singleSucursal] : []
    camaras = camarasBySuc.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      sucursalId: c.sucursalId,
      sucursal: sucursalNombre(c.sucursalId),
      temperaturaMin: c.temperaturaMin,
      temperaturaMax: c.temperaturaMax,
      estado: c.activo,
    }))
    loading = loadingBySuc
  }

  const columns: ColumnDef<CamaraSummaryResponse>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/camaras/${row.id}`)}>
          {v}
        </span>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: sucursales.map((s) => ({ label: s.nombre, value: s.nombre })),
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium" onClick={() => navigate(`/sucursales/${row.sucursalId}`)}>
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'temperaturaMin',
      label: 'Rango temp. (°C)',
      sortable: true,
      render: (_, row) => {
        const min = row.temperaturaMin
        const max = row.temperaturaMax
        if (min == null && max == null) return <span className={styles.cellMuted}>No asignado</span>
        if (min != null && max != null) return <span>[{min}, {max}]</span>
        return <span>{min != null ? min : max}</span>
      },
    },
    {
      key: 'estado',
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

  const deleteMutation = useDeleteCamara()

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (cam: CamaraSummaryResponse) => {
    setEditing(cam)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta cámara?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Cámara eliminada')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al eliminar'))
    }
  }

  const editingCamaraData = editing
    ? {
        id: editing.id,
        nombre: editing.nombre,
        descripcion: editing.descripcion || '',
        sucursalId: sucursales.find((s) => s.nombre === editing.sucursal)?.id ?? 0,
        temperaturaMin: editing.temperaturaMin ?? null,
        temperaturaMax: editing.temperaturaMax ?? null,
      }
    : undefined

  const defaultSucursalId = user?.sucursalId || (sucursales.length === 1 ? sucursales[0].id : 0)
  const canSelectSucursal = isSuperAdmin || isAdminEmpresa

  return (
    <div>
      <PageHeader title="Cámaras" description="Gestión de cámaras de temperatura">
        {canManage && (
          <button
            onClick={openCreate}
            className={styles.createBtn}
          >
            + Nueva cámara
          </button>
        )}
      </PageHeader>

      <DataTable
        data={camaras}
        columns={columns}
        loading={loading}
        rowKey={(c) => c.id}
        pagination={isSuperAdmin && pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay cámaras registradas"
        actions={(cam) => (
          <>
            <button
              onClick={() => openEdit(cam)}
              className={styles.editBtn}
            >
              Editar
            </button>
            <button
              onClick={() => handleDelete(cam.id)}
              className={styles.deleteBtn}
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
        >
          <CamaraForm
            camara={editingCamaraData}
            sucursales={sucursales}
            canSelectSucursal={canSelectSucursal ?? false}
            defaultSucursalId={defaultSucursalId}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

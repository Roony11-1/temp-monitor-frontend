import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSensoresPage, useRenewApiKey } from '../hooks/useSensores'
import { useCamaras } from '../../camaras/hooks/useCamaras'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useSucursales } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { useUrlFilters } from '../../../shared/hooks/useUrlFilters'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { SensorForm } from '../components/SensorForm'
import type { SensorSummaryResponse, RegistroSensorResponse } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SensoresPage.module.css'

export function Sensores() {
  const { isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editingSensor, setEditingSensor] = useState<SensorSummaryResponse | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newKeyData, setNewKeyData] = useState<RegistroSensorResponse | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { filters, setFilters } = useUrlFilters()

  const { data: pageData, isLoading } = useSensoresPage(page, pageSize, filters)
  const { data: camaras = [] } = useCamaras()
  const { data: empresas = [] } = useEmpresas()
  const { data: sucursales = [] } = useSucursales()
  const renewMutation = useRenewApiKey()

  const sensores = pageData?.content ?? []

  const estadoOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Deshabilitado', value: 'DESHABILITADO' },
    { label: 'Pendiente', value: 'PENDIENTE' },
  ]

  const openEdit = (sensor: SensorSummaryResponse) => {
    setEditingSensor(sensor)
    setShowModal(true)
  }

  const handleRenew = async (sensor: SensorSummaryResponse) => {
    try {
      const result = await renewMutation.mutateAsync(sensor.uuid)
      setNewKeyData(result)
      setShowKeyModal(true)
    } catch {
      alert('Error al renovar la API key')
    }
  }

  const columns: ColumnDef<SensorSummaryResponse>[] = [
    {
      key: 'macAddress',
      label: 'MAC Address',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-mono text-xs" onClick={() => navigate(`/sensores/${row.uuid}/lecturas`)}>
          {v}
        </span>
      ),
    },
    {
      key: 'uuid',
      label: 'UUID',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.mono}>{v}</span>,
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: estadoOptions,
      render: (v) => (
        <div className={styles.badgeCenter}>
          <Badge variant={v === 'ACTIVO' ? 'success' : v === 'DESHABILITADO' ? 'danger' : 'warning'}>
            {v}
          </Badge>
        </div>
      ),
    },
    {
      key: 'camaraNombre',
      label: 'Cámara',
      sortable: true,
      filterable: false,
      render: (v, row) =>
        row.camaraId ? (
          <span
            className="cursor-pointer hover:text-indigo-600 font-medium"
            onClick={() => navigate(`/camaras/${row.camaraId}`)}
          >
            {v}
          </span>
        ) : (
          <span className={styles.cellMuted}>-</span>
        ),
    },
    {
      key: 'empresaNombre',
      label: 'Empresa',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: empresas.map((e) => ({ label: e.nombre, value: e.nombre })),
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'sucursalNombre',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: sucursales.map((s) => ({ label: s.nombre, value: s.nombre })),
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
  ]

  return (
    <div>
      <PageHeader title="Sensores" description="Administración de sensores">
        {isSuperAdmin && (
          <button
            onClick={() => navigate('/sensores/registrar')}
            className={styles.createBtn}
          >
            + Registrar sensor
          </button>
        )}
        <button
          onClick={() => navigate('/sensores/simular')}
          className={styles.createBtn}
        >
          Simular Lectura
        </button>
      </PageHeader>

      <DataTable
        data={sensores}
        columns={columns}
        loading={isLoading}
        rowKey={(s) => s.id}
        pagination={pageData ? { page: pageData.page, pageSize: pageData.pageSize, total: pageData.total } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        onFilterChange={setFilters}
        initialFilters={filters}
        emptyMessage="No hay sensores registrados"
        actions={(sensor) => (
          <div className={styles.actions}>
            <button
              onClick={() => openEdit(sensor)}
              className={styles.editBtn}
            >
              Editar
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => handleRenew(sensor)}
                className={styles.saveBtn}
                disabled={renewMutation.isPending}
              >
                {renewMutation.isPending ? '...' : 'Renovar API Key'}
              </button>
            )}
          </div>
        )}
      />

      {showModal && editingSensor && (
        <Modal title="Editar sensor" onClose={() => setShowModal(false)}>
          <SensorForm
            uuid={editingSensor.uuid}
            defaultValues={{ estado: editingSensor.estado, camaraId: editingSensor.camaraId ?? null }}
            camaras={camaras}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}

      {showKeyModal && newKeyData && (
        <Modal title="API Key renovada" onClose={() => setShowKeyModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>UUID</p>
              <code style={{ fontSize: '13px', wordBreak: 'break-all' }}>{newKeyData.uuid}</code>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Nueva API Key</p>
              <code style={{ fontSize: '13px', wordBreak: 'break-all', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', display: 'block' }}>{newKeyData.apiKey}</code>
            </div>
            <p style={{ fontSize: '12px', color: '#ef4444' }}>
              Copiá esta API Key. No se volverá a mostrar.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

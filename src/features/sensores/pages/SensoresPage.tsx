import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSensores } from '../hooks/useSensores'
import { useCamaras } from '../../camaras/hooks/useCamaras'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useSucursales } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Modal } from '../../../components/Modal'
import { DataTable } from '../../../components/DataTable'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import { SensorForm } from '../components/SensorForm'
import type { Sensor } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SensoresPage.module.css'

export function Sensores() {
  const { isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null)

  const { data: sensores = [], isLoading } = useSensores()
  const { data: camaras = [] } = useCamaras()
  const { data: empresas = [] } = useEmpresas()
  const { data: sucursales = [] } = useSucursales()

  const estadoOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Deshabilitado', value: 'DESHABILITADO' },
    { label: 'Pendiente', value: 'PENDIENTE' },
  ]

  const openEdit = (sensor: Sensor) => {
    setEditingSensor(sensor)
    setShowModal(true)
  }

  const columns: ColumnDef<Sensor>[] = [
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
      key: 'camara',
      label: 'Cámara',
      sortable: false,
      filterable: false,
      render: (_, row) => <span>{row.camara?.nombre ?? '-'}</span>,
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

        emptyMessage="No hay sensores registrados"
        actions={(sensor) => (
          <button
            onClick={() => openEdit(sensor)}
            className={styles.editBtn}
          >
            Editar
          </button>
        )}
      />

      {showModal && editingSensor && (
        <Modal title="Editar sensor" onClose={() => setShowModal(false)}>
          <SensorForm
            uuid={editingSensor.uuid}
            defaultValues={{ estado: editingSensor.estado, camaraId: editingSensor.camara?.id ?? null }}
            camaras={camaras}
            onSaved={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

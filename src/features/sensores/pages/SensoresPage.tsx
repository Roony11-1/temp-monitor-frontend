import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSensores, useActualizarSensor } from '../hooks/useSensores'
import { useCamaras } from '../../camaras/hooks/useCamaras'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useSucursales } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { DataTable } from '../../../components/DataTable'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageHeader } from '../../../shared/components/ui/PageHeader'
import type { Sensor } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SensoresPage.module.css'

export function Sensores() {
  const { isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const { data: sensores = [], isLoading } = useSensores()
  const { data: camaras = [] } = useCamaras()
  const { data: empresas = [] } = useEmpresas()
  const { data: sucursales = [] } = useSucursales()
  const actualizarMutation = useActualizarSensor()
  const [editandoUuid, setEditandoUuid] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ estado: string; camaraId: string }>({ estado: '', camaraId: '' })
  const [saving, setSaving] = useState(false)

  const entrarEnEdicion = (sensor: Sensor) => {
    setEditandoUuid(sensor.uuid)
    setEditForm({ estado: sensor.estado, camaraId: String(sensor.camara?.id ?? '') })
  }

  const cancelarEdicion = () => {
    setEditandoUuid(null)
    setEditForm({ estado: '', camaraId: '' })
  }

  const guardarEdicion = async () => {
    if (!editandoUuid) return
    const original = sensores.find((s) => s.uuid === editandoUuid)
    if (!original) return

    const body: { estado?: string; camaraId?: number } = {}

    if (editForm.estado !== original.estado) {
      body.estado = editForm.estado
    }

    const newCamaraId = editForm.camaraId ? Number(editForm.camaraId) : null
    const oldCamaraId = original.camara?.id ?? null
    if (newCamaraId !== oldCamaraId && newCamaraId !== null) {
      body.camaraId = newCamaraId
    }

    if (Object.keys(body).length === 0) {
      cancelarEdicion()
      return
    }

    setSaving(true)
    try {
      await actualizarMutation.mutateAsync({ uuid: editandoUuid, data: body })
      toast.success('Sensor actualizado')
      cancelarEdicion()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar cambios'))
    } finally {
      setSaving(false)
    }
  }

  const estadoOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Deshabilitado', value: 'DESHABILITADO' },
    { label: 'Pendiente', value: 'PENDIENTE' },
  ]

  const columns: ColumnDef<Sensor>[] = [
    {
      key: 'lecturas',
      label: '',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <Link
          to={`/sensores/${row.uuid}/lecturas`}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Ver lecturas
        </Link>
      ),
    },
    {
      key: 'macAddress',
      label: 'MAC Address',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.mono}>{v}</span>,
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
      render: (v, row) => {
        if (editandoUuid === row.uuid && row.estado !== 'PENDIENTE') {
          return (
            <select
              value={editForm.estado}
              onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value }))}
              className={styles.inlineSelect}
              autoFocus
            >
              {estadoOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )
        }
        return (
          <div className={styles.badgeCenter}>
            <Badge variant={v === 'ACTIVO' ? 'success' : v === 'DESHABILITADO' ? 'danger' : 'warning'}>
              {v}
            </Badge>
          </div>
        )
      },
    },
    {
      key: 'camara',
      label: 'Cámara',
      sortable: false,
      filterable: false,
      render: (_, row) => {
        if (editandoUuid === row.uuid) {
          return (
            <select
              value={editForm.camaraId}
              onChange={(e) => setEditForm((f) => ({ ...f, camaraId: e.target.value }))}
              className={styles.inlineSelect}
            >
              <option value="">Sin cámara</option>
              {camaras.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )
        }
        return <span>{row.camara?.nombre ?? '-'}</span>
      },
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
        onRowClick={(row) => {
          if (!editandoUuid) {
            entrarEnEdicion(row)
          }
        }}
        emptyMessage="No hay sensores registrados"
        actions={editandoUuid ? (sensor) =>
          sensor.uuid === editandoUuid ? (
            <div className={styles.actions}>
              <button
                onClick={guardarEdicion}
                disabled={saving}
                className={styles.saveBtn}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={cancelarEdicion}
                disabled={saving}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
            </div>
          ) : undefined
        : undefined}
      />
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { useSucursal } from '../hooks/useSucursales'
import { useCamarasBySucursal } from '../../camaras/hooks/useCamaras'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../components/DataTable'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Camara } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './SucursalDetailPage.module.css'

export function SucursalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const sucursalId = Number(id)
  const { data: sucursal, isLoading: loadingSuc, isError: errorSuc } = useSucursal(sucursalId)
  const { data: camaras = [], isLoading: loadingCam } = useCamarasBySucursal(sucursalId)

  const columns: ColumnDef<Camara>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellName}>{v}</span>,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
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
          <Badge variant={v ? 'success' : 'danger'}>{v ? 'Activo' : 'Inactivo'}</Badge>
        </div>
      ),
    },
  ]

  if (loadingSuc || loadingCam) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="120px" /></Card>
        <Card><LoadingSkeleton width="100%" height="200px" /></Card>
      </div>
    )
  }

  if (errorSuc) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/sucursales')} className={styles.backBtn}>
              &larr;
            </button>
            <div>
              <h1 className={styles.pageTitle}>Sucursal no encontrada</h1>
              <p className={styles.pageSubtitle}>No se pudo cargar la sucursal o no tiene acceso a ella.</p>
            </div>
          </div>
        </div>
        <Card>
          <p className="py-8 text-center text-sm text-gray-500">La sucursal no existe o no está disponible en tu ámbito de acceso.</p>
        </Card>
      </div>
    )
  }

  if (!sucursal) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/sucursales')}
            className={styles.backBtn}
          >
            &larr;
          </button>
          <div>
            <h1 className={styles.pageTitle}>{sucursal.nombre}</h1>
            <p className={styles.pageSubtitle}>Detalle de sucursal</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/sucursales/${id}/editar`)}
          className={styles.editBtn}
        >
          Editar
        </button>
      </div>

      <Card>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Dirección</p>
            <p className={styles.fieldValue}>{sucursal.direccion || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Teléfono</p>
            <p className={styles.fieldValue}>{sucursal.telefono || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Estado</p>
            <div className={styles.badgeWrapper}>
              <Badge variant={sucursal.activo ? 'success' : 'danger'}>
                {sucursal.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className={styles.sectionTitle}>
          Cámaras ({camaras.length})
        </h2>
        <DataTable
          data={camaras}
          columns={columns}
          rowKey={(c) => c.id}
          onRowClick={(c) => navigate(`/camaras/${c.id}`)}
          emptyMessage="No tiene cámaras asignadas"
        />
      </div>
    </div>
  )
}

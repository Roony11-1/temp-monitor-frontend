import { useParams, useNavigate } from 'react-router-dom'
import { useEmpresa } from '../hooks/useEmpresas'
import { useSucursalesByEmpresa } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../components/DataTable'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Sucursal } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './EmpresaDetailPage.module.css'

export function EmpresaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const empresaId = Number(id)
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresa(empresaId)
  const { data: sucursales = [], isLoading: loadingSucursales } = useSucursalesByEmpresa(empresaId)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')

  const columns: ColumnDef<Sucursal>[] = [
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

  if (loadingEmpresa || loadingSucursales) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="120px" /></Card>
        <Card><LoadingSkeleton width="100%" height="200px" /></Card>
      </div>
    )
  }

  if (!empresa) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/empresas')}
            className={styles.backBtn}
          >
            &larr;
          </button>
          <div>
            <h1 className={styles.pageTitle}>{empresa.nombre}</h1>
            <p className={styles.pageSubtitle}>Detalle de empresa</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/empresas/${id}/editar`)}
            className={styles.editBtn}
          >
            Editar
          </button>
        )}
      </div>

      <Card>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Dirección</p>
            <p className={styles.fieldValue}>{empresa.direccion || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Teléfono</p>
            <p className={styles.fieldValue}>{empresa.telefono || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Email</p>
            <p className={styles.fieldValue}>{empresa.email || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Estado</p>
            <div className={styles.badgeWrapper}>
              <Badge variant={empresa.activo ? 'success' : 'danger'}>
                {empresa.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Sucursales ({sucursales.length})
        </h2>
        <DataTable
          data={sucursales}
          columns={columns}
          rowKey={(s) => s.id}
          onRowClick={(s) => navigate(`/sucursales/${s.id}`)}
          emptyMessage="No tiene sucursales asignadas"
        />
      </div>
    </div>
  )
}

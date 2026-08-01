import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEmpresa } from '../hooks/useEmpresas'
import { useSucursalesByEmpresa } from '../../sucursales/hooks/useSucursales'
import { useUsuariosByEmpresa } from '../../usuarios/hooks/useUsuarios'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../components/DataTable'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { SucursalSummaryResponse, UsuarioSummaryResponse } from '../../../types'
import type { ColumnDef } from '../../../types/table'
import styles from './EmpresaDetailPage.module.css'

type TabKey = 'sucursales' | 'usuarios'

export function EmpresaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<TabKey>('sucursales')
  const empresaId = Number(id)
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresa(empresaId)
  const { data: sucursales = [], isLoading: loadingSucursales } = useSucursalesByEmpresa(empresaId)
  const { data: usuarios = [], isLoading: loadingUsuarios } = useUsuariosByEmpresa(empresaId)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const canEdit = isSuperAdmin || user?.roles?.includes('ADMIN_EMPRESA')

  const sucursalColumns: ColumnDef<SucursalSummaryResponse>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/sucursales/${row.id}`)}>
          {v}
        </span>
      ),
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

  const usuarioColumns: ColumnDef<UsuarioSummaryResponse>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      render: (v, row) => (
        <span className="cursor-pointer hover:text-indigo-600 font-medium text-gray-900" onClick={() => navigate(`/usuarios/${row.id}`)}>
          {v}
        </span>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{v || '-'}</span>,
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      filterable: true,
      render: (v, row) =>
        row.sucursalId ? (
          <span className="cursor-pointer hover:text-indigo-600 font-medium" onClick={() => navigate(`/sucursales/${row.sucursalId}`)}>
            {v || '-'}
          </span>
        ) : (
          <span className={styles.cellMuted}>{v || '-'}</span>
        ),
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: true,
      filterable: true,
      render: (v) => <span className={styles.cellMuted}>{Array.isArray(v) ? v.join(', ') : v || '-'}</span>,
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

  if (loadingEmpresa) {
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

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'sucursales' ? styles.tabActive : ''}`}
          onClick={() => setTab('sucursales')}
        >
          Sucursales ({sucursales.length})
        </button>
        <button
          className={`${styles.tab} ${tab === 'usuarios' ? styles.tabActive : ''}`}
          onClick={() => setTab('usuarios')}
        >
          Usuarios ({usuarios.length})
        </button>
      </div>

      <div className={styles.section}>
        {tab === 'sucursales' && (
          <DataTable
            data={sucursales}
            columns={sucursalColumns}
            loading={loadingSucursales}
            rowKey={(s) => s.id}
            onRowClick={(s) => navigate(`/sucursales/${s.id}`)}
            emptyMessage="No tiene sucursales asignadas"
          />
        )}
        {tab === 'usuarios' && (
          <DataTable
            data={usuarios}
            columns={usuarioColumns}
            loading={loadingUsuarios}
            rowKey={(u) => u.id}
            emptyMessage="No tiene usuarios asignados"
          />
        )}
      </div>
    </div>
  )
}

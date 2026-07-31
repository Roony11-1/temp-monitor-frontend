import { useParams, useNavigate } from 'react-router-dom'
import { useCamara } from '../hooks/useCamaras'
import { useSucursales } from '../../sucursales/hooks/useSucursales'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { CamaraForm } from '../components/CamaraForm'
import styles from './CamaraEditPage.module.css'

export function CamaraEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: camara, isLoading } = useCamara(Number(id))
  const { data: sucursales = [] } = useSucursales()

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA') ?? false

  if (isLoading) return (
    <div className={styles.skeletonSpace}>
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="200px" /></Card>
    </div>
  )

  if (!camara) return null

  const camaraData = {
    id: camara.id,
    nombre: camara.nombre,
    descripcion: camara.descripcion || '',
    sucursalId: camara.sucursalId,
    temperaturaMin: camara.temperaturaMin ?? null,
    temperaturaMax: camara.temperaturaMax ?? null,
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/camaras/${id}`)}
          className={styles.backBtn}
        >
          &larr;
        </button>
        <h1 className={styles.title}>Editar {camara.nombre}</h1>
      </div>

      <Card>
        <CamaraForm
          camara={camaraData}
          sucursales={sucursales}
          canSelectSucursal={isSuperAdmin || isAdminEmpresa}
          defaultSucursalId={camara.sucursalId}
          onSaved={() => navigate(`/camaras/${id}`)}
          onCancel={() => navigate(`/camaras/${id}`)}
        />
      </Card>
    </div>
  )
}

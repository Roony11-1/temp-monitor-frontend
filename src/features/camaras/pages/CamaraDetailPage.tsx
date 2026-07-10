import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCamara } from '../../../api/camaras'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Camara } from '../../../types'
import styles from './CamaraDetailPage.module.css'

export function CamaraDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [camara, setCamara] = useState<Camara | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCamara(Number(id))
      .then(setCamara)
      .catch(() => navigate('/camaras'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (!camara) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/camaras')}
            className={styles.backBtn}
          >
            &larr;
          </button>
          <div>
            <h1 className={styles.pageTitle}>{camara.nombre}</h1>
            <p className={styles.pageSubtitle}>Detalle de cámara</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/camaras/${id}/editar`)}
          className={styles.editBtn}
        >
          Editar
        </button>
      </div>

      <Card>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Descripción</p>
            <p className={styles.fieldValue}>{camara.descripcion || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Estado</p>
            <div className={styles.badgeWrapper}>
              <Badge variant={camara.activo ? 'success' : 'danger'}>
                {camara.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

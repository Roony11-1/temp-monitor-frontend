import { useParams, useNavigate } from 'react-router-dom'
import { useCamara } from '../hooks/useCamaras'
import { useSensoresByCamara } from '../../sensores/hooks/useSensores'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import styles from './CamaraDetailPage.module.css'

export function CamaraDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const camaraId = Number(id)
  const { data: camara, isLoading } = useCamara(camaraId)
  const { data: sensores = [] } = useSensoresByCamara(camaraId)

  if (isLoading) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (!camara) return null

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return <Badge variant="success">Activo</Badge>
      case 'DESHABILITADO': return <Badge variant="danger">Deshabilitado</Badge>
      default: return <Badge variant="warning">Pendiente</Badge>
    }
  }

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
            <p className={styles.fieldLabel}>Rango temp. (°C)</p>
            <p className={styles.fieldValue}>
              {camara.temperaturaMin != null && camara.temperaturaMax != null
                ? `[${camara.temperaturaMin}, ${camara.temperaturaMax}]`
                : camara.temperaturaMin != null || camara.temperaturaMax != null
                  ? (camara.temperaturaMin ?? camara.temperaturaMax)
                  : 'No asignado'}
            </p>
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

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Sensores Asociados</h2>
        <span className={styles.sectionCount}>{sensores.length}</span>
      </div>

      {sensores.length === 0 ? (
        <Card>
          <p className={styles.emptyText}>No hay sensores asociados a esta cámara</p>
        </Card>
      ) : (
        <Card padding="none">
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeader}>MAC Address</th>
                <th className={styles.tableHeader}>UUID</th>
                <th className={styles.tableHeader}>Estado</th>
                <th className={styles.tableHeader}>Último Contacto</th>
              </tr>
            </thead>
            <tbody>
              {sensores.map((s) => (
                <tr key={s.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{s.macAddress}</td>
                  <td className={styles.tableCell}>
                    <span className={styles.mono}>{s.uuid}</span>
                  </td>
                  <td className={styles.tableCell}>{estadoBadge(s.estado)}</td>
                  <td className={styles.tableCell}>
                    {s.ultimoContacto
                      ? new Date(s.ultimoContacto).toLocaleString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

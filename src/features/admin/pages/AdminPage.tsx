import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCompactacion, useCompactacionJob } from '../hooks/useCompactacion'
import { parseDetalle } from '../api/compactacion'
import toast from 'react-hot-toast'
import styles from './AdminPage.module.css'

export function AdminPage() {
  const { isSuperAdmin } = useAuth()
  const { jobs, jobsLoading, ejecutar, isEjecutando } = useCompactacion()
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const { data: activeJob } = useCompactacionJob(activeJobId)

  if (!isSuperAdmin) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Administración</h1>
        <p className={styles.subtitle}>Acceso denegado. Solo SUPER_ADMIN.</p>
      </div>
    )
  }

  const handleEjecutar = async () => {
    if (!confirm('¿Ejecutar compactación? Se agruparán lecturas >30d en DAILY y se purgará el bruto. Es idempotente.')) return
    const toastId = toast.loading('Iniciando compactación...')
    try {
      const job = await ejecutar()
      setActiveJobId(job.id)
      toast.success(`Job ${job.id.slice(0, 8)} iniciado`, { id: toastId })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al ejecutar'
      toast.error(msg, { id: toastId })
    }
  }

  const detalle = activeJob ? parseDetalle(activeJob) : []

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Administración</h1>
        <p className={styles.subtitle}>Operaciones de mantenimiento — compactación de lecturas</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Compactación</h2>
        <p className={styles.cardDesc}>
          Agrupa lecturas crudas &gt;30 días en buckets <code>DAILY</code> y luego a <code>MONTHLY</code> (&gt;12 meses) y purga el bruto. 
          Es idempotente (<code>ON CONFLICT DO NOTHING</code>) y se ejecuta por lotes.
        </p>
        <div className={styles.meta}>
          <span>Retención: 30d / 12m</span>
          <span>Zona: UTC</span>
          <span>Lote: 100k</span>
        </div>
        <button onClick={handleEjecutar} disabled={isEjecutando || activeJob?.estado === 'RUNNING'} className={styles.primaryBtn}>
          {isEjecutando ? 'Iniciando...' : activeJob?.estado === 'RUNNING' ? 'Ejecutando...' : 'Ejecutar compactación'}
        </button>
        {activeJob && (
          <div className={styles.jobStatus}>
            <p><strong>Job:</strong> {activeJob.id} — <span className={activeJob.estado === 'RUNNING' ? styles.running : activeJob.estado === 'COMPLETED' ? styles.completed : styles.failed}>{activeJob.estado}</span></p>
            <p><strong>Iniciado:</strong> {new Date(activeJob.iniciadoEn).toLocaleString()} {activeJob.ejecutadoPorEmail && <>por {activeJob.ejecutadoPorEmail}</>}</p>
            {activeJob.terminadoEn && <p><strong>Terminado:</strong> {new Date(activeJob.terminadoEn).toLocaleString()}</p>}
            {activeJob.estado === 'COMPLETED' && (
              <>
                <p><strong>Totales:</strong> {activeJob.totalDiarios ?? 0} diarios, {activeJob.totalMensuales ?? 0} mensuales, {activeJob.totalPurgados ?? 0} purgados</p>
                {detalle.length > 0 && (
                  <table className={styles.table}>
                    <thead><tr><th>Handler</th><th>Diarios</th><th>Mensuales</th><th>Purgados</th></tr></thead>
                    <tbody>{detalle.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.diarios}</td><td>{d.mensuales}</td><td>{d.purgados}</td></tr>)}</tbody>
                  </table>
                )}
              </>
            )}
            {activeJob.error && <p className={styles.error}>Error: {activeJob.error}</p>}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Últimos jobs</h2>
        {jobsLoading ? <p>Cargando...</p> : jobs.length === 0 ? <p>Sin ejecuciones aún.</p> : (
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Estado</th><th>Iniciado</th><th>Por</th><th>Totales</th><th></th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className={j.id === activeJobId ? styles.activeRow : ''}>
                  <td title={j.id}>{j.id.slice(0, 8)}</td>
                  <td><span className={j.estado === 'COMPLETED' ? styles.completed : j.estado === 'FAILED' ? styles.failed : styles.running}>{j.estado}</span></td>
                  <td>{new Date(j.iniciadoEn).toLocaleString()}</td>
                  <td>{j.ejecutadoPorEmail ?? '-'}</td>
                  <td>{j.estado === 'COMPLETED' ? `${j.totalDiarios ?? 0}/${j.totalMensuales ?? 0}/${j.totalPurgados ?? 0}` : '-'}</td>
                  <td><button onClick={() => setActiveJobId(j.id)} className={styles.linkBtn}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

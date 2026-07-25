import { useParams, useNavigate } from 'react-router-dom'
import { useEmpresa } from '../hooks/useEmpresas'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { EmpresaForm } from '../components/EmpresaForm'
import styles from './EmpresaEditPage.module.css'

export function EmpresaEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: empresa, isLoading } = useEmpresa(Number(id))

  if (isLoading) return (
    <div className={styles.skeletonSpace}>
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="200px" /></Card>
    </div>
  )

  if (!empresa) return null

  const empresaData = {
    id: empresa.id,
    nombre: empresa.nombre,
    direccion: empresa.direccion || '',
    telefono: empresa.telefono || '',
    email: empresa.email || '',
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/empresas/${id}`)}
          className={styles.backBtn}
        >
          &larr;
        </button>
        <h1 className={styles.title}>Editar {empresa.nombre}</h1>
      </div>

      <Card>
        <EmpresaForm
          empresa={empresaData}
          onSaved={() => navigate(`/empresas/${id}`)}
          onCancel={() => navigate(`/empresas/${id}`)}
        />
      </Card>
    </div>
  )
}

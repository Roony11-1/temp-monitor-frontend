import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmpresa } from '../../../api/empresas'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { EmpresaForm, type EmpresaFormHandle } from '../components/EmpresaForm'
import type { Empresa } from '../../../types'
import styles from './EmpresaEditPage.module.css'

export function EmpresaEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const formRef = useRef<EmpresaFormHandle>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getEmpresa(Number(id))
      .then(setEmpresa)
      .catch(() => navigate('/empresas'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
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

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      navigate(`/empresas/${id}`)
    } catch {
      setSaving(false)
    }
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
        <EmpresaForm ref={formRef} empresa={empresaData} onSaved={() => {}} />
      </Card>

      <div className={styles.actions}>
        <button
          onClick={() => navigate(`/empresas/${id}`)}
          disabled={saving}
          className={styles.cancelBtn}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

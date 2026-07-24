import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSucursal } from '../hooks/useSucursales'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { SucursalForm, type SucursalFormHandle } from '../components/SucursalForm'
import styles from './SucursalEditPage.module.css'

export function SucursalEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<SucursalFormHandle>(null)
  const { data: sucursal, isLoading } = useSucursal(Number(id))
  const { data: empresas = [] } = useEmpresas()
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false

  if (isLoading) return (
    <div className={styles.skeletonSpace}>
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="200px" /></Card>
    </div>
  )

  if (!sucursal) return null

  const sucursalData = {
    id: sucursal.id,
    nombre: sucursal.nombre,
    direccion: sucursal.direccion || '',
    telefono: sucursal.telefono || '',
    empresaId: sucursal.empresaId,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      navigate(`/sucursales/${id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/sucursales/${id}`)}
          className={styles.backBtn}
        >
          &larr;
        </button>
        <h1 className={styles.title}>Editar {sucursal.nombre}</h1>
      </div>

      <Card>
        <SucursalForm
          ref={formRef}
          sucursal={sucursalData}
          empresas={empresas}
          isSuperAdmin={isSuperAdmin}
          defaultEmpresaId={sucursal.empresaId}
          onSaved={() => {}}
        />
      </Card>

      <div className={styles.actions}>
        <button
          onClick={() => navigate(`/sucursales/${id}`)}
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

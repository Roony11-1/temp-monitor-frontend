import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSucursal } from '../../../api/sucursales'
import { getEmpresas } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { SucursalForm, type SucursalFormHandle } from '../components/SucursalForm'
import type { Sucursal, Empresa } from '../../../types'
import styles from './SucursalEditPage.module.css'

export function SucursalEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const formRef = useRef<SucursalFormHandle>(null)
  const [sucursal, setSucursal] = useState<Sucursal | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') ?? false

  useEffect(() => {
    if (!id) return
    Promise.all([getSucursal(Number(id)), getEmpresas()])
      .then(([suc, emps]) => {
        setSucursal(suc)
        setEmpresas(emps)
      })
      .catch(() => navigate('/sucursales'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
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

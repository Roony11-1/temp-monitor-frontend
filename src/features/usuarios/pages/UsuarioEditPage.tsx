import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUsuario } from '../../../api/usuarios'
import { getEmpresas } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { UsuarioForm, type UsuarioFormHandle } from '../components/UsuarioForm'
import type { Usuario, Empresa } from '../../../types'
import styles from './UsuarioEditPage.module.css'

export function UsuarioEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const formRef = useRef<UsuarioFormHandle>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') ?? false
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA') ?? false
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !canManage

  useEffect(() => {
    if (!id) return
    Promise.all([getUsuario(Number(id)), getEmpresas()])
      .then(([usr, emps]) => {
        setUsuario(usr)
        setEmpresas(emps)
      })
      .catch(() => navigate('/usuarios'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.skeletonSpace}>
      <LoadingSkeleton width="200px" height="28px" />
      <Card><LoadingSkeleton width="100%" height="300px" /></Card>
    </div>
  )

  if (!usuario) return null

  const usuarioData = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre || '',
    telefono: usuario.telefono || '',
    empresaId: usuario.empresaId,
    sucursalId: usuario.sucursalId,
    roles: usuario.roles,
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await formRef.current?.submit()
      navigate(`/usuarios/${id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/usuarios/${id}`)}
          className={styles.backBtn}
        >
          &larr;
        </button>
        <h1 className={styles.title}>Editar {usuario.email}</h1>
      </div>

      <Card>
        <UsuarioForm
          ref={formRef}
          usuario={usuarioData}
          empresas={empresas}
          canManage={canManage}
          isReadOnly={isReadOnly}
          defaultEmpresaId={usuario.empresaId}
          onSaved={() => {}}
        />
      </Card>

      <div className={styles.actions}>
        <button
          onClick={() => navigate(`/usuarios/${id}`)}
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

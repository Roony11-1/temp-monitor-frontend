import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUsuario } from '../hooks/useUsuarios'
import { useEmpresas } from '../../empresas/hooks/useEmpresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { UsuarioForm, type UsuarioFormHandle } from '../components/UsuarioForm'

import styles from './UsuarioEditPage.module.css'

export function UsuarioEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const formRef = useRef<UsuarioFormHandle>(null)
  const [saving, setSaving] = useState(false)

  const { data: usuario, isLoading } = useUsuario(Number(id))
  const { data: empresas = [] } = useEmpresas()

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN') ?? false
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA') ?? false
  const canManage = isSuperAdmin || isAdminEmpresa
  const isReadOnly = !canManage

  if (isLoading) return (
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

import { useParams, useNavigate } from 'react-router-dom'
import { useUsuario } from '../hooks/useUsuarios'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Rol } from '../../../types'
import styles from './UsuarioDetailPage.module.css'

export function UsuarioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { data: usuario, isLoading, isError } = useUsuario(Number(id))

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canEdit = isSuperAdmin || isAdminEmpresa || usuario?.id === currentUser?.id

  if (isLoading) {
    return (
      <div className={styles.skeletonSpace}>
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/usuarios')} className={styles.backBtn}>
              &larr;
            </button>
            <div>
              <h1 className={styles.pageTitle}>Usuario no encontrado</h1>
              <p className={styles.pageSubtitle}>No se pudo cargar el usuario o no tiene acceso a él.</p>
            </div>
          </div>
        </div>
        <Card>
          <p className="py-8 text-center text-sm text-gray-500">El usuario no existe o no está disponible en tu ámbito de acceso.</p>
        </Card>
      </div>
    )
  }

  if (!usuario) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/usuarios')}
            className={styles.backBtn}
          >
            &larr;
          </button>
          <div>
            <h1 className={styles.pageTitle}>{usuario.email}</h1>
            <p className={styles.pageSubtitle}>Detalle de usuario</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/usuarios/${id}/editar`)}
            className={styles.editBtn}
          >
            Editar
          </button>
        )}
      </div>

      <Card>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Email</p>
            <p className={styles.fieldValue}>{usuario.email}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Nombre</p>
            <p className={styles.fieldValue}>{usuario.nombre || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Teléfono</p>
            <p className={styles.fieldValue}>{usuario.telefono || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Roles</p>
            <div className={styles.roleList}>
              {usuario.roles.map((rol: Rol) => (
                <Badge key={rol} variant="info" size="sm">
                  {rol}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className={styles.fieldLabel}>Empresa</p>
            <p className={styles.fieldValue}>{usuario.empresa || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Sucursal</p>
            <p className={styles.fieldValue}>{usuario.sucursal || '-'}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Estado</p>
            <div className={styles.badgeWrapper}>
              <Badge variant={usuario.activo ? 'success' : 'danger'}>
                {usuario.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
          {usuario.lastLogin && (
            <div>
              <p className={styles.fieldLabel}>
                Último acceso
              </p>
              <p className={styles.fieldValue}>
                {new Date(usuario.lastLogin).toLocaleString('es-CL')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

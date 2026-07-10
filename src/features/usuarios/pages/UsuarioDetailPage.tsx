import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUsuario } from '../../../api/usuarios'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { Badge } from '../../../shared/components/ui/Badge'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import type { Usuario, Rol } from '../../../types'

export function UsuarioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = currentUser?.roles?.includes('ADMIN_EMPRESA')
  const canEdit = isSuperAdmin || isAdminEmpresa || usuario?.id === currentUser?.id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUsuario(Number(id))
      .then(setUsuario)
      .catch(() => navigate('/usuarios'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton width="200px" height="28px" />
        <Card><LoadingSkeleton width="100%" height="160px" /></Card>
      </div>
    )
  }

  if (!usuario) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/usuarios')}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            &larr;
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{usuario.email}</h1>
            <p className="text-sm text-gray-500">Detalle de usuario</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate(`/usuarios/${id}/editar`)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm text-gray-900 mt-1">{usuario.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nombre</p>
            <p className="text-sm text-gray-900 mt-1">{usuario.nombre || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Teléfono</p>
            <p className="text-sm text-gray-900 mt-1">{usuario.telefono || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Roles</p>
            <div className="flex gap-1 flex-wrap mt-1">
              {usuario.roles.map((rol: Rol) => (
                <Badge key={rol} variant="info" size="sm">
                  {rol}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <Badge variant={usuario.activo ? 'success' : 'danger'}>
                {usuario.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
          {usuario.lastLogin && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Último acceso
              </p>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(usuario.lastLogin).toLocaleString('es-CL')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUsuario } from '../../../api/usuarios'
import { getEmpresas } from '../../../api/empresas'
import { useAuth } from '../../../contexts/AuthContext'
import { Card } from '../../../shared/components/ui/Card'
import { LoadingSkeleton } from '../../../shared/components/ui/LoadingSkeleton'
import { UsuarioForm, type UsuarioFormHandle } from '../components/UsuarioForm'
import type { Usuario, Empresa } from '../../../types'

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
    <div className="space-y-6">
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/usuarios/${id}`)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar {usuario.email}</h1>
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

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(`/usuarios/${id}`)}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getEmpresas, getEmpresa } from '../api/empresas'
import { getSucursales, getSucursalesByEmpresa, getSucursal } from '../api/sucursales'
import { getCamaras, getCamarasBySucursal } from '../api/camaras'
import { getUsuarios, getUsuariosByEmpresa, getUsuariosBySucursal } from '../api/usuarios'
import { useAuth } from '../contexts/AuthContext'

export function Dashboard() {
  const { user } = useAuth()
  const [empresasCount, setEmpresasCount] = useState(0)
  const [sucursalesCount, setSucursalesCount] = useState(0)
  const [camarasCount, setCamarasCount] = useState(0)
  const [usuariosCount, setUsuariosCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN')
  const isAdminEmpresa = user?.roles?.includes('ADMIN_EMPRESA')

  useEffect(() => {
    if (isSuperAdmin) {
      Promise.all([getEmpresas(), getSucursales(), getCamaras(), getUsuarios()])
        .then(([empresas, sucursales, camaras, usuarios]) => {
          setEmpresasCount(empresas.length)
          setSucursalesCount(sucursales.length)
          setCamarasCount(camaras.length)
          setUsuariosCount(usuarios.length)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (isAdminEmpresa && user?.empresaId) {
      Promise.all([
        getEmpresa(user.empresaId),
        getSucursalesByEmpresa(user.empresaId),
        getUsuariosByEmpresa(user.empresaId),
      ])
        .then(([_, sucursales, usuarios]) => {
          setEmpresasCount(1)
          setSucursalesCount(sucursales.length)
          setUsuariosCount(usuarios.length)
          const sucIds = sucursales.map((s) => s.id)
          return Promise.all(sucIds.map((id) => getCamarasBySucursal(id)))
        })
        .then((results) => {
          const total = results.reduce((sum, arr) => sum + arr.length, 0)
          setCamarasCount(total)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (user?.empresaId) {
      const promises: Promise<any>[] = [getEmpresa(user.empresaId)]
      setEmpresasCount(1)

      if (user?.sucursalId) {
        promises.push(getSucursal(user.sucursalId))
        promises.push(getCamarasBySucursal(user.sucursalId))
        promises.push(getUsuariosBySucursal(user.sucursalId))
      } else {
        promises.push(Promise.resolve([]))
        promises.push(Promise.resolve([]))
        promises.push(Promise.resolve([]))
      }

      Promise.all(promises)
        .then(([_, sucursales, camaras, usuarios]) => {
          setSucursalesCount(Array.isArray(sucursales) ? sucursales.length : 1)
          setCamarasCount(camaras.length)
          setUsuariosCount(usuarios.length)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const cards = [
    { label: 'Empresas', value: empresasCount, color: 'bg-blue-500', icon: '🏢' },
    { label: 'Sucursales', value: sucursalesCount, color: 'bg-green-500', icon: '📍' },
    { label: 'Cámaras', value: camarasCount, color: 'bg-amber-500', icon: '📷' },
    { label: 'Usuarios', value: usuariosCount, color: 'bg-purple-500', icon: '👥' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bienvenido, {user?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                {loading ? (
                  <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

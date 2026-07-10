import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createUsuario, updateUsuario } from '../../../api/usuarios'
import toast from 'react-hot-toast'
import type { UsuarioRequest, Empresa, Rol } from '../../../types'

export interface UsuarioFormHandle {
  submit: () => Promise<void>
}

const ROLES: Rol[] = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_SUCURSAL', 'TECNICO', 'USUARIO']

interface Props {
  usuario?: { id: number } & Omit<UsuarioRequest, 'password'>
  empresas: Empresa[]
  canManage: boolean
  isReadOnly: boolean
  defaultEmpresaId: number | null
  onSaved: () => void
}

export const UsuarioForm = forwardRef<UsuarioFormHandle, Props>(
  ({ usuario, empresas, canManage, isReadOnly, defaultEmpresaId, onSaved }, ref) => {
    const { register, handleSubmit, watch, setValue, getValues } = useForm<UsuarioRequest>({
      defaultValues: {
        email: '',
        password: '',
        nombre: '',
        telefono: '',
        empresaId: null,
        sucursalId: null,
        roles: ['USUARIO'],
      },
    })

    const watchedRoles = watch('roles')
    const isEditing = !!usuario?.id

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(
        async (data) => {
          if (isEditing) {
            await updateUsuario(usuario!.id, {
              email: data.email,
              nombre: data.nombre,
              telefono: data.telefono,
              empresaId: data.empresaId,
              sucursalId: data.sucursalId,
              roles: data.roles,
            })
            toast.success('Usuario actualizado')
          } else {
            await createUsuario(data)
            toast.success('Usuario creado')
          }
          onSaved()
        },
        (errors) => {
          const first = Object.values(errors)[0]
          if (first?.message) toast.error(first.message)
        },
      ),
    }), [handleSubmit, isEditing, usuario, onSaved])

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            {...register('email', { required: 'El email es obligatorio' })}
            defaultValue={usuario?.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password', { required: !isEditing && 'La contraseña es obligatoria' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            {...register('nombre')}
            defaultValue={usuario?.nombre}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            {...register('telefono')}
            defaultValue={usuario?.telefono}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        {!isReadOnly && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              {...register('empresaId', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
              defaultValue={usuario?.empresaId ?? defaultEmpresaId ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Sin empresa</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        {canManage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
            <div className="flex flex-wrap gap-3">
              {ROLES.map((rol) => (
                <label key={rol} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchedRoles.includes(rol)}
                    onChange={() => {
                      const current = getValues('roles')
                      if (current.includes(rol)) {
                        setValue('roles', current.filter((r) => r !== rol))
                      } else {
                        setValue('roles', [...current, rol])
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{rol}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)

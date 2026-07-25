import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateUsuario, useUpdateUsuario } from '../../usuarios/hooks/useUsuarios'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormSelect, FormButton } from '../../../shared/components/form'
import type { UsuarioRequest, Empresa, Rol } from '../../../types'

const ROLES: Rol[] = ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_SUCURSAL', 'TECNICO', 'USUARIO']

interface Props {
  usuario?: { id: number } & Omit<UsuarioRequest, 'password'>
  empresas: Empresa[]
  canManage: boolean
  isReadOnly: boolean
  defaultEmpresaId: number | null
  onSaved: () => void
  onCancel?: () => void
}

export function UsuarioForm({ usuario, empresas, canManage, isReadOnly, defaultEmpresaId, onSaved, onCancel }: Props) {
  const isEditing = !!usuario?.id
  const createMutation = useCreateUsuario()
  const updateMutation = useUpdateUsuario(usuario?.id ?? 0)

  const methods = useForm<UsuarioRequest>({
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      telefono: '',
      empresaId: defaultEmpresaId,
      sucursalId: null,
      roles: ['USUARIO'],
    },
  })

  const watchedRoles = methods.watch('roles')

  useEffect(() => {
    if (usuario) {
      methods.reset({
        email: usuario.email,
        password: '',
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        empresaId: usuario.empresaId,
        sucursalId: usuario.sucursalId,
        roles: usuario.roles,
      })
    }
  }, [usuario, methods.reset])

  const mutation = isEditing ? updateMutation : createMutation

  const onSubmit = async (data: UsuarioRequest) => {
    try {
      if (isEditing) {
        await mutation.mutateAsync({
          email: data.email,
          nombre: data.nombre,
          telefono: data.telefono,
          empresaId: data.empresaId,
          sucursalId: data.sucursalId,
          roles: data.roles,
        } as UsuarioRequest)
      } else {
        await mutation.mutateAsync(data)
      }
      toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado')
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar'))
    }
  }

  const empresaOptions = empresas.map((e) => ({ label: e.nombre, value: e.id }))

  const toggleRole = (rol: Rol) => {
    const current = methods.getValues('roles')
    if (current.includes(rol)) {
      methods.setValue('roles', current.filter((r) => r !== rol))
    } else {
      methods.setValue('roles', [...current, rol])
    }
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput
        label="Email"
        name="email"
        type="email"
        rules={{ required: 'El email es obligatorio' }}
      />
      {!isEditing && (
        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          rules={{ required: !isEditing && 'La contraseña es obligatoria' }}
        />
      )}
      <FormInput
        label="Nombre"
        name="nombre"
      />
      <FormInput
        label="Teléfono"
        name="telefono"
      />
      {!isReadOnly && (
        <FormSelect
          label="Empresa"
          name="empresaId"
          options={empresaOptions}
          placeholder="Sin empresa"
          rules={{ setValueAs: (v: string) => (v === '' ? null : Number(v)) }}
        />
      )}
      {canManage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Roles</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((rol) => (
              <label key={rol} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchedRoles?.includes(rol)}
                  onChange={() => toggleRole(rol as Rol)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{rol}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
        )}
        <FormButton isLoading={mutation.isPending}>
          {isEditing ? 'Guardar cambios' : 'Crear usuario'}
        </FormButton>
      </div>
    </Form>
  )
}

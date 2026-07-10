import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createUsuario, updateUsuario } from '../../../api/usuarios'
import toast from 'react-hot-toast'
import type { UsuarioRequest, Empresa, Rol } from '../../../types'
import styles from './UsuarioForm.module.css'

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
    const { register, handleSubmit, watch, setValue, getValues, reset } = useForm<UsuarioRequest>({
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

    const watchedRoles = watch('roles')
    const isEditing = !!usuario?.id

    useEffect(() => {
      if (usuario) {
        reset({
          email: usuario.email,
          password: '',
          nombre: usuario.nombre,
          telefono: usuario.telefono,
          empresaId: usuario.empresaId,
          sucursalId: usuario.sucursalId,
          roles: usuario.roles,
        })
      }
    }, [usuario, reset])

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
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Email</label>
          <input type="email" {...register('email', { required: 'El email es obligatorio' })} className={styles.input} />
        </div>
        {!isEditing && (
          <div>
            <label className={styles.label}>Contraseña</label>
            <input type="password" {...register('password', { required: !isEditing && 'La contraseña es obligatoria' })} className={styles.input} />
          </div>
        )}
        <div>
          <label className={styles.label}>Nombre</label>
          <input type="text" {...register('nombre')} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Teléfono</label>
          <input type="text" {...register('telefono')} className={styles.input} />
        </div>
        {!isReadOnly && (
          <div>
            <label className={styles.label}>Empresa</label>
            <select {...register('empresaId', { setValueAs: (v) => (v === '' ? null : Number(v)) })} className={styles.input}>
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
            <label className={styles.label}>Roles</label>
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

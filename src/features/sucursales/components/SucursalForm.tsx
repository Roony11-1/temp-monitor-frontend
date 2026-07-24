import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createSucursal, updateSucursal } from '../../sucursales/api/sucursales'
import toast from 'react-hot-toast'
import type { SucursalRequest, Empresa } from '../../../types'
import styles from './SucursalForm.module.css'

export interface SucursalFormHandle {
  submit: () => Promise<void>
}

interface Props {
  sucursal?: { id: number } & SucursalRequest
  empresas: Empresa[]
  isSuperAdmin: boolean
  defaultEmpresaId: number
  onSaved: () => void
}

export const SucursalForm = forwardRef<SucursalFormHandle, Props>(
  ({ sucursal, empresas, isSuperAdmin, defaultEmpresaId, onSaved }, ref) => {
    const { register, handleSubmit, reset } = useForm<SucursalRequest>({
      defaultValues: {
        nombre: '',
        direccion: '',
        telefono: '',
        empresaId: defaultEmpresaId,
      },
    })

    const isEditing = !!sucursal?.id

    useEffect(() => {
      if (sucursal) {
        reset({
          nombre: sucursal.nombre,
          direccion: sucursal.direccion,
          telefono: sucursal.telefono,
          empresaId: sucursal.empresaId,
        })
      }
    }, [sucursal, reset])

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(
        async (data) => {
          if (isEditing) {
            await updateSucursal(sucursal!.id, data)
            toast.success('Sucursal actualizada')
          } else {
            await createSucursal(data)
            toast.success('Sucursal creada')
          }
          onSaved()
        },
        (errors) => {
          const first = Object.values(errors)[0]
          if (first?.message) toast.error(first.message)
        },
      ),
    }), [handleSubmit, isEditing, sucursal, onSaved])

    return (
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Nombre</label>
          <input type="text" {...register('nombre', { required: 'El nombre es obligatorio' })} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Dirección</label>
          <input type="text" {...register('direccion')} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Teléfono</label>
          <input type="text" {...register('telefono')} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Empresa</label>
          <select {...register('empresaId', { valueAsNumber: true })} disabled={!isSuperAdmin} className={styles.input}>
            <option value={0}>Seleccione una empresa</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  },
)

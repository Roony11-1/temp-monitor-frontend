import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createCamara, updateCamara } from '../../camaras/api/camaras'
import toast from 'react-hot-toast'
import type { CamaraRequest, Sucursal } from '../../../types'
import styles from './CamaraForm.module.css'

export interface CamaraFormHandle {
  submit: () => Promise<void>
}

interface Props {
  camara?: { id: number } & CamaraRequest
  sucursales: Sucursal[]
  canSelectSucursal: boolean
  defaultSucursalId: number
  onSaved: () => void
}

export const CamaraForm = forwardRef<CamaraFormHandle, Props>(
  ({ camara, sucursales, canSelectSucursal, defaultSucursalId, onSaved }, ref) => {
    const { register, handleSubmit, reset } = useForm<CamaraRequest>({
      defaultValues: {
        nombre: '',
        descripcion: '',
        sucursalId: defaultSucursalId,
      },
    })

    const isEditing = !!camara?.id

    useEffect(() => {
      if (camara) {
        reset({
          nombre: camara.nombre,
          descripcion: camara.descripcion,
          sucursalId: camara.sucursalId,
        })
      }
    }, [camara, reset])

    useImperativeHandle(ref, () => ({
      submit: handleSubmit(
        async (data) => {
          if (isEditing) {
            await updateCamara(camara!.id, data)
            toast.success('Cámara actualizada')
          } else {
            await createCamara(data)
            toast.success('Cámara creada')
          }
          onSaved()
        },
        (errors) => {
          const first = Object.values(errors)[0]
          if (first?.message) toast.error(first.message)
        },
      ),
    }), [handleSubmit, isEditing, camara, onSaved])

    return (
      <div className={styles.container}>
        <div>
          <label className={styles.label}>Nombre</label>
          <input type="text" {...register('nombre', { required: 'El nombre es obligatorio' })} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Descripción</label>
          <input type="text" {...register('descripcion')} className={styles.input} />
        </div>
        <div>
          <label className={styles.label}>Sucursal</label>
          <select {...register('sucursalId', { valueAsNumber: true })} disabled={!canSelectSucursal} className={styles.input}>
            <option value={0}>Seleccione una sucursal</option>
            {sucursales.map((suc) => (
              <option key={suc.id} value={suc.id}>
                {suc.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  },
)

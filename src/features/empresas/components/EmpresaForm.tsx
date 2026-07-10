import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createEmpresa, updateEmpresa } from '../../../api/empresas'
import toast from 'react-hot-toast'
import type { EmpresaRequest } from '../../../types'
import styles from './EmpresaForm.module.css'

export interface EmpresaFormHandle {
  submit: () => Promise<void>
}

interface Props {
  empresa?: { id: number } & EmpresaRequest
  onSaved: () => void
}

export const EmpresaForm = forwardRef<EmpresaFormHandle, Props>(({ empresa, onSaved }, ref) => {
  const { register, handleSubmit, reset } = useForm<EmpresaRequest>({
    defaultValues: { nombre: '', direccion: '', telefono: '', email: '' },
  })

  const isEditing = !!empresa?.id

  useEffect(() => {
    if (empresa) {
      reset({
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
      })
    }
  }, [empresa, reset])

  useImperativeHandle(ref, () => ({
    submit: handleSubmit(
      async (data) => {
        if (isEditing) {
          await updateEmpresa(empresa!.id, data)
          toast.success('Empresa actualizada')
        } else {
          await createEmpresa(data)
          toast.success('Empresa creada')
        }
        onSaved()
      },
      (errors) => {
        const first = Object.values(errors)[0]
        if (first?.message) toast.error(first.message)
      },
    ),
  }), [handleSubmit, isEditing, empresa, onSaved])

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
          <label className={styles.label}>Email</label>
          <input type="email" {...register('email')} className={styles.input} />
        </div>
      </div>
  )
})

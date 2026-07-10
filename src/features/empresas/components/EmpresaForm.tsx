import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createEmpresa, updateEmpresa } from '../../../api/empresas'
import toast from 'react-hot-toast'
import type { EmpresaRequest } from '../../../types'

export interface EmpresaFormHandle {
  submit: () => Promise<void>
}

interface Props {
  empresa?: { id: number } & EmpresaRequest
  onSaved: () => void
}

export const EmpresaForm = forwardRef<EmpresaFormHandle, Props>(({ empresa, onSaved }, ref) => {
  const { register, handleSubmit } = useForm<EmpresaRequest>({
    defaultValues: { nombre: '', direccion: '', telefono: '', email: '' },
  })

  const isEditing = !!empresa?.id

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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input
          type="text"
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          defaultValue={empresa?.nombre}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <input
          type="text"
          {...register('direccion')}
          defaultValue={empresa?.direccion}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input
          type="text"
          {...register('telefono')}
          defaultValue={empresa?.telefono}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          defaultValue={empresa?.email}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
    </div>
  )
})

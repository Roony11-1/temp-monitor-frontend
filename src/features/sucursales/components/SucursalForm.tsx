import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createSucursal, updateSucursal } from '../../../api/sucursales'
import toast from 'react-hot-toast'
import type { SucursalRequest, Empresa } from '../../../types'

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
    const { register, handleSubmit } = useForm<SucursalRequest>({
      defaultValues: {
        nombre: '',
        direccion: '',
        telefono: '',
        empresaId: 0,
      },
    })

    const isEditing = !!sucursal?.id

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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            defaultValue={sucursal?.nombre}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            {...register('direccion')}
            defaultValue={sucursal?.direccion}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            {...register('telefono')}
            defaultValue={sucursal?.telefono}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <select
            {...register('empresaId', { valueAsNumber: true })}
            defaultValue={sucursal?.empresaId ?? defaultEmpresaId}
            disabled={!isSuperAdmin}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
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

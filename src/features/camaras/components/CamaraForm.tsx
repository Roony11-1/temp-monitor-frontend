import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { createCamara, updateCamara } from '../../../api/camaras'
import toast from 'react-hot-toast'
import type { CamaraRequest, Sucursal } from '../../../types'

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
    const { register, handleSubmit } = useForm<CamaraRequest>({
      defaultValues: {
        nombre: '',
        descripcion: '',
        sucursalId: 0,
      },
    })

    const isEditing = !!camara?.id

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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            defaultValue={camara?.nombre}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            {...register('descripcion')}
            defaultValue={camara?.descripcion}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
          <select
            {...register('sucursalId', { valueAsNumber: true })}
            defaultValue={camara?.sucursalId ?? defaultSucursalId}
            disabled={!canSelectSucursal}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
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

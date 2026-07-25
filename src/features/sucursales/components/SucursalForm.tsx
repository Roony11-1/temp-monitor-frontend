import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateSucursal, useUpdateSucursal } from '../../sucursales/hooks/useSucursales'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormSelect, FormButton } from '../../../shared/components/form'
import type { SucursalRequest, Empresa } from '../../../types'

interface Props {
  sucursal?: { id: number } & SucursalRequest
  empresas: Empresa[]
  isSuperAdmin: boolean
  defaultEmpresaId: number
  onSaved: () => void
  onCancel?: () => void
}

export function SucursalForm({ sucursal, empresas, isSuperAdmin, defaultEmpresaId, onSaved, onCancel }: Props) {
  const isEditing = !!sucursal?.id
  const createMutation = useCreateSucursal()
  const updateMutation = useUpdateSucursal(sucursal?.id ?? 0)

  const methods = useForm<SucursalRequest>({
    defaultValues: {
      nombre: '',
      direccion: '',
      telefono: '',
      empresaId: defaultEmpresaId,
    },
  })

  useEffect(() => {
    if (sucursal) {
      methods.reset({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        empresaId: sucursal.empresaId,
      })
    }
  }, [sucursal, methods.reset])

  const mutation = isEditing ? updateMutation : createMutation

  const onSubmit = async (data: SucursalRequest) => {
    try {
      await mutation.mutateAsync(data)
      toast.success(isEditing ? 'Sucursal actualizada' : 'Sucursal creada')
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar'))
    }
  }

  const empresaOptions = empresas.map((e) => ({ label: e.nombre, value: e.id }))

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput
        label="Nombre"
        name="nombre"
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormInput
        label="Dirección"
        name="direccion"
      />
      <FormInput
        label="Teléfono"
        name="telefono"
      />
      <FormSelect
        label="Empresa"
        name="empresaId"
        options={empresaOptions}
        placeholder="Seleccione una empresa"
        disabled={!isSuperAdmin}
        rules={{ setValueAs: (v: string) => Number(v) }}
      />
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
        )}
        <FormButton isLoading={mutation.isPending}>
          {isEditing ? 'Guardar cambios' : 'Crear sucursal'}
        </FormButton>
      </div>
    </Form>
  )
}

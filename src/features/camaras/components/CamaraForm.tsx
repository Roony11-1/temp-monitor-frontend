import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateCamara, useUpdateCamara } from '../../camaras/hooks/useCamaras'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormSelect, FormButton } from '../../../shared/components/form'
import type { CamaraRequest, Sucursal } from '../../../types'

interface Props {
  camara?: { id: number } & CamaraRequest
  sucursales: Sucursal[]
  canSelectSucursal: boolean
  defaultSucursalId: number
  onSaved: () => void
  onCancel?: () => void
}

export function CamaraForm({ camara, sucursales, canSelectSucursal, defaultSucursalId, onSaved, onCancel }: Props) {
  const isEditing = !!camara?.id
  const createMutation = useCreateCamara()
  const updateMutation = useUpdateCamara(camara?.id ?? 0)

  const methods = useForm<CamaraRequest>({
    defaultValues: {
      nombre: '',
      descripcion: '',
      sucursalId: defaultSucursalId,
      temperaturaMin: null,
      temperaturaMax: null,
    },
  })

  useEffect(() => {
    if (camara) {
      methods.reset({
        nombre: camara.nombre,
        descripcion: camara.descripcion,
        sucursalId: camara.sucursalId,
        temperaturaMin: camara.temperaturaMin ?? null,
        temperaturaMax: camara.temperaturaMax ?? null,
      })
    }
  }, [camara, methods.reset])

  const mutation = isEditing ? updateMutation : createMutation

  const onSubmit = async (data: CamaraRequest) => {
    try {
      await mutation.mutateAsync(data)
      toast.success(isEditing ? 'Cámara actualizada' : 'Cámara creada')
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar'))
    }
  }

  const validarRangoParcial = (value: number | null, otroExtremo: number | null) =>
    (value != null) !== (otroExtremo != null) ? 'Indicá ambos extremos o dejá ambos vacíos' : true

  const sucursalOptions = sucursales.map((s) => ({ label: s.nombre, value: s.id }))

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput
        label="Nombre"
        name="nombre"
        rules={{ required: 'El nombre es obligatorio' }}
      />
      <FormInput
        label="Descripción"
        name="descripcion"
      />
      <FormSelect
        label="Sucursal"
        name="sucursalId"
        options={sucursalOptions}
        placeholder="Seleccione una sucursal"
        disabled={!canSelectSucursal}
        rules={{ setValueAs: (v: string) => Number(v) }}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Temperatura mínima (°C)"
          name="temperaturaMin"
          type="number"
          step="0.1"
          placeholder="Ej: 5"
          rules={{
            setValueAs: (v: string) => (v === '' ? null : Number(v)),
            validate: (v) => validarRangoParcial(v, methods.getValues('temperaturaMax')),
          }}
        />
        <FormInput
          label="Temperatura máxima (°C)"
          name="temperaturaMax"
          type="number"
          step="0.1"
          placeholder="Ej: 40"
          rules={{
            setValueAs: (v: string) => (v === '' ? null : Number(v)),
            validate: (v) => validarRangoParcial(v, methods.getValues('temperaturaMin')),
          }}
        />
      </div>
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
        )}
        <FormButton isLoading={mutation.isPending}>
          {isEditing ? 'Guardar cambios' : 'Crear cámara'}
        </FormButton>
      </div>
    </Form>
  )
}

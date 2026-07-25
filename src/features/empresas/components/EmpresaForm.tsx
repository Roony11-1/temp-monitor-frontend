import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateEmpresa, useUpdateEmpresa } from '../../empresas/hooks/useEmpresas'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { Form, FormInput, FormButton } from '../../../shared/components/form'
import type { EmpresaRequest } from '../../../types'

interface Props {
  empresa?: { id: number } & EmpresaRequest
  onSaved: () => void
  onCancel?: () => void
}

export function EmpresaForm({ empresa, onSaved, onCancel }: Props) {
  const isEditing = !!empresa?.id
  const createMutation = useCreateEmpresa()
  const updateMutation = useUpdateEmpresa(empresa?.id ?? 0)

  const methods = useForm<EmpresaRequest>({
    defaultValues: { nombre: '', direccion: '', telefono: '', email: '' },
  })

  useEffect(() => {
    if (empresa) {
      methods.reset({
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
      })
    }
  }, [empresa, methods.reset])

  const mutation = isEditing ? updateMutation : createMutation

  const onSubmit = async (data: EmpresaRequest) => {
    try {
      await mutation.mutateAsync(data)
      toast.success(isEditing ? 'Empresa actualizada' : 'Empresa creada')
      onSaved()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al guardar'))
    }
  }

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
      <FormInput
        label="Email"
        name="email"
        type="email"
      />
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Cancelar
          </button>
        )}
        <FormButton isLoading={mutation.isPending}>
          {isEditing ? 'Guardar cambios' : 'Crear empresa'}
        </FormButton>
      </div>
    </Form>
  )
}

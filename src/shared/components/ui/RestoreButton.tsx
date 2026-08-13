import { useState } from 'react'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../../utils/error'
import { cn } from '../../utils/cn'

interface RestoreButtonProps {
  onRestore: () => Promise<unknown>
  confirmMessage?: string
  successMessage?: string
  variant?: 'text' | 'solid'
}

export function RestoreButton({
  onRestore,
  confirmMessage = '¿Restaurar este elemento?',
  successMessage = 'Elemento restaurado',
  variant = 'text',
}: RestoreButtonProps) {
  const [pending, setPending] = useState(false)

  const handleClick = async () => {
    if (!confirm(confirmMessage)) return
    setPending(true)
    try {
      await onRestore()
      toast.success(successMessage)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Error al restaurar'))
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={cn(
        'text-sm font-medium transition-colors',
        variant === 'solid'
          ? 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
          : 'text-green-600 hover:text-green-800',
      )}
    >
      {pending ? '...' : 'Restaurar'}
    </button>
  )
}

import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/auth'
import { getApiErrorMessage } from '../../../shared/utils/error'
import { parseJwt } from '../../../utils/jwt'
import type { LoginRequest, AuthUser } from '../../../types'

export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.token)
      const claims = parseJwt(res.token)
      const userData: AuthUser = {
        id: Number(claims.sub),
        email: claims.email || res.email,
        roles: claims.roles || [],
        empresaId: claims.empresaId ?? null,
        sucursalId: claims.sucursalId ?? null,
      }
      localStorage.setItem('user', JSON.stringify(userData))
      window.dispatchEvent(new Event('auth-changed'))
      toast.success('Inicio de sesión exitoso')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Credenciales inválidas'))
    },
  })
}

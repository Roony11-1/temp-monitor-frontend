import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useLogin'
import { Form, FormInput, FormButton } from '../../../shared/components/form'
import type { LoginRequest } from '../../../types'
import styles from './LoginPage.module.css'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const methods = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
  })
  const loginMutation = useLogin()

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Temp Monitor</h1>
          <p className={styles.subtitle}>Sistema de monitoreo de temperatura</p>
        </div>
        <Form methods={methods} onSubmit={onSubmit}>
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            rules={{ required: 'El email es obligatorio' }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...methods.register('password', { required: 'La contraseña es obligatoria' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {methods.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">{methods.formState.errors.password.message}</p>
            )}
          </div>
          <FormButton isLoading={loginMutation.isPending}>Ingresar</FormButton>
        </Form>
      </div>
    </div>
  )
}

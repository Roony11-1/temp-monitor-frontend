import { useState } from 'react'
import { useLogin } from '../hooks/useLogin'
import styles from './LoginPage.module.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Temp Monitor</h1>
          <p className={styles.subtitle}>Sistema de monitoreo de temperatura</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="usuario@ejemplo.com"
            />
          </div>
          <div>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={styles.button}
          >
            {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

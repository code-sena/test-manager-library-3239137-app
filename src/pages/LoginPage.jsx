import { useState } from 'react'
import Banner from '../components/Banner.jsx'
import { api, session } from '../api.js'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError(null)
    setSending(true)

    try {
      const result = await api.login(username, password)
      session.save(result.access_token, result.role)
      onLogin(result.role)
    } catch (failure) {
      // El backend no dice si falló el usuario o la clave, y la pantalla
      // tampoco lo adivina (CA-01.2).
      setError(failure)
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="card login" onSubmit={submit}>
      <h1>Manager Library</h1>
      <Banner error={error} />

      <label>
        Usuario
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" disabled={sending}>
        {sending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

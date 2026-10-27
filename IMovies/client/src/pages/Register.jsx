import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Message from '../components/Message'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-box">
      <h2>Create your account</h2>
      <form onSubmit={submit}>
        <Message>{error}</Message>
        <label>Full name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Phone (optional)<input value={form.phone} onChange={set('phone')} /></label>
        <label>Password (min 6 characters)<input type="password" minLength={6} required value={form.password} onChange={set('password')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </main>
  )
}

import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Message from '../../components/Message'

export default function AdminLogin() {
  const { user, adminLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await adminLogin(form.email, form.password)
      navigate('/admin', { replace: true })
    } catch (err) { setError(err.message) }
  }

  return (
    <main className="auth-box">
      <h2>🔐 Admin login</h2>
      <form onSubmit={submit}>
        <Message>{error}</Message>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        <button className="btn">Login</button>
      </form>
      <p className="muted"><Link to="/">← Back to website</Link></p>
    </main>
  )
}

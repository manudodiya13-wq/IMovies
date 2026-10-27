import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import Message from '../components/Message'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', currentPassword: '', newPassword: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    const body = { name: form.name, phone: form.phone }
    if (form.newPassword) Object.assign(body, { currentPassword: form.currentPassword, newPassword: form.newPassword })
    try {
      const d = await api.put('/auth/me', body)
      setUser({ ...user, ...d.user })
      setForm({ ...form, currentPassword: '', newPassword: '' })
      setInfo('Profile updated')
    } catch (err) { setError(err.message) }
  }

  return (
    <main className="auth-box">
      <h2>My profile</h2>
      <form onSubmit={submit}>
        <Message>{error}</Message>
        <Message type="success">{info}</Message>
        <label>Email<input value={user.email} disabled /></label>
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <hr />
        <p className="muted">Change password (optional)</p>
        <label>Current password<input type="password" value={form.currentPassword} onChange={set('currentPassword')} /></label>
        <label>New password<input type="password" minLength={6} value={form.newPassword} onChange={set('newPassword')} /></label>
        <button className="btn">Save changes</button>
      </form>
    </main>
  )
}

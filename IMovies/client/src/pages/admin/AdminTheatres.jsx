import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'

// "A:10:Regular, B:10:Premium, C:8:Recliner"  ->  [{row:'A', seats:10, type:'Regular'}, ...]
const parseLayout = (text) =>
  text.split(',').map((s) => s.trim()).filter(Boolean).map((part) => {
    const [row, seats, type = 'Regular'] = part.split(':').map((x) => x.trim())
    return { row, seats: Number(seats), type }
  })
const layoutText = (layout) => layout.map((l) => `${l.row}:${l.seats}:${l.type}`).join(', ')
const DEFAULT_LAYOUT = 'A:10:Regular, B:10:Regular, C:10:Premium, D:8:Recliner'

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState([])
  const [form, setForm] = useState({ name: '', city: '', address: '' })
  const [editId, setEditId] = useState(null)
  const [screenForm, setScreenForm] = useState({}) // per theatre: { name, layout }
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const load = useCallback(() => api.get('/theatres').then((d) => setTheatres(d.theatres)).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  const run = async (fn, okMsg) => {
    setError(''); setInfo('')
    try { await fn(); if (okMsg) setInfo(okMsg); load() } catch (err) { setError(err.message) }
  }

  const submitTheatre = (e) => {
    e.preventDefault()
    run(async () => {
      if (editId) await api.put(`/theatres/${editId}`, form)
      else await api.post('/theatres', form)
      setForm({ name: '', city: '', address: '' }); setEditId(null)
    }, editId ? 'Theatre updated' : 'Theatre added')
  }

  const addScreen = (t) => {
    const f = screenForm[t._id] || {}
    run(async () => {
      await api.post(`/theatres/${t._id}/screens`, { name: f.name, layout: parseLayout(f.layout || DEFAULT_LAYOUT) })
      setScreenForm({ ...screenForm, [t._id]: {} })
    }, 'Screen added')
  }

  const setSF = (id, k, v) => setScreenForm({ ...screenForm, [id]: { ...screenForm[id], [k]: v } })

  return (
    <>
      <h1>Theatres &amp; Screens</h1>
      <Message>{error}</Message>
      <Message type="success">{info}</Message>

      <form className="card pad form-grid" onSubmit={submitTheatre}>
        <h3 className="span2">{editId ? 'Edit theatre' : 'Add a theatre'}</h3>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>City<input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
        <label className="span2">Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        <div className="row gap span2">
          <button className="btn">{editId ? 'Update' : 'Add theatre'}</button>
          {editId && <button type="button" className="btn ghost" onClick={() => { setEditId(null); setForm({ name: '', city: '', address: '' }) }}>Cancel</button>}
        </div>
      </form>

      {theatres.map((t) => (
        <div className="card pad" key={t._id}>
          <div className="row between">
            <h3>{t.name} <span className="muted small-text">{t.city}{t.address ? ` · ${t.address}` : ''}</span></h3>
            <div className="actions">
              <button className="btn small ghost" onClick={() => { setEditId(t._id); setForm({ name: t.name, city: t.city, address: t.address || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Edit</button>
              <button className="btn small danger" onClick={() => window.confirm('Remove theatre?') && run(() => api.del(`/theatres/${t._id}`), 'Theatre removed')}>Delete</button>
            </div>
          </div>
          {t.screens.map((s) => (
            <div className="row between screen-line" key={s._id}>
              <span><b>{s.name}</b> — {layoutText(s.layout)} ({s.layout.reduce((n, r) => n + r.seats, 0)} seats)</span>
              <button className="btn small danger" onClick={() => window.confirm('Delete screen?') && run(() => api.del(`/theatres/${t._id}/screens/${s._id}`), 'Screen deleted')}>Delete</button>
            </div>
          ))}
          <div className="row gap wrap screen-add">
            <input placeholder="New screen name" value={screenForm[t._id]?.name || ''} onChange={(e) => setSF(t._id, 'name', e.target.value)} />
            <input className="grow" placeholder={`Layout: ${DEFAULT_LAYOUT}`} value={screenForm[t._id]?.layout || ''} onChange={(e) => setSF(t._id, 'layout', e.target.value)} />
            <button className="btn small" onClick={() => addScreen(t)}>Add screen</button>
          </div>
        </div>
      ))}
      <p className="muted small-text">Layout format: <code>Row:SeatCount:Type</code> separated by commas. Types: Regular, Premium, Recliner.</p>
    </>
  )
}

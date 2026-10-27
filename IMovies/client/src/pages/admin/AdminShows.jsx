import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'
import { fmtDateTime, money } from '../../utils'

export default function AdminShows() {
  const [movies, setMovies] = useState([])
  const [theatres, setTheatres] = useState([])
  const [shows, setShows] = useState([])
  const [form, setForm] = useState({ movie: '', theatre: '', screenId: '', startTime: '', Regular: 150, Premium: 250, Recliner: 400 })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const loadShows = useCallback(() => api.get('/shows').then((d) => setShows(d.shows)).catch((e) => setError(e.message)), [])
  useEffect(() => {
    api.get('/movies?limit=50').then((d) => setMovies(d.movies)).catch((e) => setError(e.message))
    api.get('/theatres').then((d) => setTheatres(d.theatres)).catch((e) => setError(e.message))
    loadShows()
  }, [loadShows])

  const screens = theatres.find((t) => t._id === form.theatre)?.screens || []
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value, ...(k === 'theatre' ? { screenId: '' } : {}) })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    try {
      await api.post('/shows', {
        movie: form.movie, theatre: form.theatre, screenId: form.screenId,
        startTime: new Date(form.startTime).toISOString(),
        prices: { Regular: Number(form.Regular), Premium: Number(form.Premium), Recliner: Number(form.Recliner) },
      })
      setInfo('Show created')
      setForm({ ...form, startTime: '' })
      loadShows()
    } catch (err) { setError(err.message) }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this show?')) return
    setError(''); setInfo('')
    try { await api.del(`/shows/${id}`); loadShows() } catch (err) { setError(err.message) }
  }

  return (
    <>
      <h1>Shows</h1>
      <Message>{error}</Message>
      <Message type="success">{info}</Message>
      <form className="card pad form-grid" onSubmit={submit}>
        <h3 className="span2">Schedule a show</h3>
        <label>Movie
          <select required value={form.movie} onChange={set('movie')}><option value="">Select movie</option>{movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}</select>
        </label>
        <label>Theatre
          <select required value={form.theatre} onChange={set('theatre')}><option value="">Select theatre</option>{theatres.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}</select>
        </label>
        <label>Screen
          <select required value={form.screenId} onChange={set('screenId')}><option value="">Select screen</option>{screens.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
        </label>
        <label>Start time<input required type="datetime-local" value={form.startTime} onChange={set('startTime')} /></label>
        <label>Regular price (₹)<input type="number" min="0" value={form.Regular} onChange={set('Regular')} /></label>
        <label>Premium price (₹)<input type="number" min="0" value={form.Premium} onChange={set('Premium')} /></label>
        <label>Recliner price (₹)<input type="number" min="0" value={form.Recliner} onChange={set('Recliner')} /></label>
        <div className="span2"><button className="btn">Create show</button></div>
      </form>

      <table>
        <thead><tr><th>Movie</th><th>Theatre</th><th>Screen</th><th>Start</th><th>Prices</th><th>Booked</th><th /></tr></thead>
        <tbody>
          {shows.length === 0 && <tr><td colSpan={7} className="muted">No upcoming shows.</td></tr>}
          {shows.map((s) => (
            <tr key={s._id}>
              <td>{s.movie?.title}</td><td>{s.theatre?.name}</td><td>{s.screenName}</td><td>{fmtDateTime(s.startTime)}</td>
              <td>{money(s.prices.Regular)} / {money(s.prices.Premium)} / {money(s.prices.Recliner)}</td><td>{s.bookedCount}</td>
              <td className="actions"><button className="btn small danger" onClick={() => remove(s._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

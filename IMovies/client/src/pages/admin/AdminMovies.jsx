import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'
import { fmtDate, toInputDate } from '../../utils'

const empty = { title: '', description: '', genre: '', language: '', duration: 120, certificate: 'UA', director: '', cast: '', releaseDate: '', poster: '', trailerUrl: '' }

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const load = useCallback(() => api.get('/movies?limit=50&sort=newest').then((d) => setMovies(d.movies)).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  const edit = (m) => {
    setEditId(m._id)
    setForm({
      title: m.title, description: m.description || '', genre: m.genre.join(', '), language: m.language, duration: m.duration,
      certificate: m.certificate, director: m.director || '', cast: (m.cast || []).map((c) => (c.role ? `${c.name}:${c.role}` : c.name)).join(', '),
      releaseDate: toInputDate(m.releaseDate), poster: m.poster || '', trailerUrl: m.trailerUrl || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const reset = () => { setEditId(null); setForm(empty) }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    const body = {
      ...form,
      duration: Number(form.duration),
      genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
      cast: form.cast.split(',').map((c) => c.trim()).filter(Boolean).map((c) => { const [name, role] = c.split(':'); return { name: name.trim(), role: role?.trim() } }),
    }
    try {
      if (editId) await api.put(`/movies/${editId}`, body)
      else await api.post('/movies', body)
      setInfo(editId ? 'Movie updated' : 'Movie added')
      reset(); load()
    } catch (err) { setError(err.message) }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this movie?')) return
    try { await api.del(`/movies/${id}`); load() } catch (err) { setError(err.message) }
  }

  return (
    <>
      <h1>Movies</h1>
      <Message>{error}</Message>
      <Message type="success">{info}</Message>
      <form className="card pad form-grid" onSubmit={submit}>
        <h3 className="span2">{editId ? 'Edit movie' : 'Add a movie'}</h3>
        <label>Title<input required value={form.title} onChange={set('title')} /></label>
        <label>Language<input required value={form.language} onChange={set('language')} /></label>
        <label>Genres (comma separated)<input required placeholder="Action, Drama" value={form.genre} onChange={set('genre')} /></label>
        <label>Duration (minutes)<input required type="number" min="1" value={form.duration} onChange={set('duration')} /></label>
        <label>Certificate
          <select value={form.certificate} onChange={set('certificate')}>{['U', 'UA', 'A', 'S'].map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label>Release date<input required type="date" value={form.releaseDate} onChange={set('releaseDate')} /></label>
        <label>Director<input value={form.director} onChange={set('director')} /></label>
        <label>Cast (Name:Role, Name:Role)<input value={form.cast} onChange={set('cast')} /></label>
        <label>Poster image URL<input value={form.poster} onChange={set('poster')} /></label>
        <label>Trailer URL<input value={form.trailerUrl} onChange={set('trailerUrl')} /></label>
        <label className="span2">Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <div className="row gap span2">
          <button className="btn">{editId ? 'Update movie' : 'Add movie'}</button>
          {editId && <button type="button" className="btn ghost" onClick={reset}>Cancel edit</button>}
        </div>
      </form>

      <table>
        <thead><tr><th>Title</th><th>Language</th><th>Genres</th><th>Release</th><th>Rating</th><th /></tr></thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m._id}>
              <td>{m.title}</td><td>{m.language}</td><td>{m.genre.join(', ')}</td><td>{fmtDate(m.releaseDate)}</td>
              <td>{m.ratingCount ? `${m.averageRating} (${m.ratingCount})` : '-'}</td>
              <td className="actions"><button className="btn small ghost" onClick={() => edit(m)}>Edit</button><button className="btn small danger" onClick={() => remove(m._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

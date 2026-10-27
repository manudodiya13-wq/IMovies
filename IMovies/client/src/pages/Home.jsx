import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import MovieCard from '../components/MovieCard'
import Message from '../components/Message'

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation']
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Kannada', 'Malayalam']

export default function Home() {
  const [params] = useSearchParams()
  const search = params.get('search') || ''
  const [filters, setFilters] = useState({ status: 'now_showing', genre: '', language: '', sort: 'newest' })
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ movies: [], pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => setPage(1), [search])

  useEffect(() => {
    const qs = new URLSearchParams({ page, limit: 12 })
    if (search) qs.set('search', search)
    Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v))
    let cancelled = false
    setLoading(true)
    api
      .get('/movies?' + qs.toString())
      .then((d) => !cancelled && (setData(d), setError('')))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [filters, page, search])

  const change = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }))
    setPage(1)
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Movie ticket booking made simple 🎬</h1>
        <p>Pick a movie, choose your seats, and pay in seconds.</p>
      </section>

      <div className="tabs">
        <button className={filters.status === 'now_showing' ? 'active' : ''} onClick={() => change('status', 'now_showing')}>Now Showing</button>
        <button className={filters.status === 'upcoming' ? 'active' : ''} onClick={() => change('status', 'upcoming')}>Upcoming</button>
      </div>

      <div className="filters">
        <select value={filters.genre} onChange={(e) => change('genre', e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={filters.language} onChange={(e) => change('language', e.target.value)}>
          <option value="">All languages</option>
          {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => change('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="title">A - Z</option>
        </select>
        {search && <span className="muted">Results for “{search}”</span>}
      </div>

      <Message>{error}</Message>
      {loading ? (
        <p className="muted center">Loading movies...</p>
      ) : data.movies.length === 0 ? (
        <p className="muted center">No movies found.</p>
      ) : (
        <div className="grid">{data.movies.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
      )}

      {data.pages > 1 && (
        <div className="pager">
          <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn small ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </main>
  )
}

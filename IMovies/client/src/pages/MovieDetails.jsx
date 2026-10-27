import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Poster } from '../components/MovieCard'
import Message from '../components/Message'
import { dayKey, fmtDate, fmtTime, money, runtime } from '../utils'

export default function MovieDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [reviews, setReviews] = useState([])
  const [saved, setSaved] = useState({ favourite: false, watchlist: false })
  const [day, setDay] = useState('')
  const [city, setCity] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [review, setReview] = useState({ rating: 5, comment: '' })

  const loadReviews = useCallback(() => api.get(`/reviews/movie/${id}`).then((d) => setReviews(d.reviews)), [id])
  const loadMovie = useCallback(() => api.get(`/movies/${id}`).then((d) => setMovie(d.movie)), [id])

  useEffect(() => {
    Promise.all([loadMovie(), api.get(`/shows?movie=${id}`).then((d) => setShows(d.shows)), loadReviews()]).catch((e) => setError(e.message))
  }, [id, loadMovie, loadReviews])

  useEffect(() => {
    if (user?.role !== 'user') return
    api.get('/favourites').then((d) => {
      const s = { favourite: false, watchlist: false }
      d.items.forEach((i) => i.movie._id === id && (s[i.type] = true))
      setSaved(s)
    }).catch(() => {})
  }, [id, user])

  const days = useMemo(() => [...new Set(shows.map((s) => dayKey(s.startTime)))], [shows])
  const cities = useMemo(() => [...new Set(shows.map((s) => s.theatre.city))], [shows])
  const activeDay = day || days[0]
  const visible = shows.filter((s) => dayKey(s.startTime) === activeDay && (!city || s.theatre.city === city))
  const byTheatre = visible.reduce((acc, s) => ((acc[s.theatre._id] ||= { theatre: s.theatre, shows: [] }).shows.push(s), acc), {})
  const myReview = user && reviews.find((r) => r.user?._id === user._id)

  const toggleSave = async (type) => {
    if (user?.role !== 'user') return navigate('/login', { state: { from: `/movie/${id}` } })
    try {
      if (saved[type]) await api.del(`/favourites/${id}?type=${type}`)
      else await api.post('/favourites', { movie: id, type })
      setSaved({ ...saved, [type]: !saved[type] })
    } catch (e) { setError(e.message) }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    try {
      await api.post('/reviews', { movie: id, rating: Number(review.rating), comment: review.comment })
      setReview({ rating: 5, comment: '' })
      setInfo('Thanks for your review!')
      await Promise.all([loadReviews(), loadMovie()])
    } catch (err) { setError(err.message) }
  }

  const deleteReview = async (rid) => {
    try {
      await api.del(`/reviews/${rid}`)
      await Promise.all([loadReviews(), loadMovie()])
    } catch (err) { setError(err.message) }
  }

  if (!movie) return <main className="container">{error ? <Message>{error}</Message> : <p className="muted center">Loading...</p>}</main>

  return (
    <main className="container">
      <section className="detail">
        <Poster movie={movie} className="big" />
        <div>
          <h1>{movie.title}</h1>
          <p className="rating">★ {movie.ratingCount ? `${movie.averageRating} (${movie.ratingCount} reviews)` : 'No ratings yet'}</p>
          <p className="chips">
            <span>{movie.certificate}</span><span>{runtime(movie.duration)}</span><span>{movie.language}</span>
            {movie.genre.map((g) => <span key={g}>{g}</span>)}
          </p>
          <p>{movie.description}</p>
          {movie.director && <p><b>Director:</b> {movie.director}</p>}
          {movie.cast?.length > 0 && <p><b>Cast:</b> {movie.cast.map((c) => (c.role ? `${c.name} (${c.role})` : c.name)).join(', ')}</p>}
          <p className="muted">Release: {fmtDate(movie.releaseDate)} {movie.status === 'upcoming' && <span className="badge">Coming soon</span>}</p>
          <div className="row gap">
            <button className={`btn small ${saved.favourite ? '' : 'ghost'}`} onClick={() => toggleSave('favourite')}>{saved.favourite ? '♥ Favourited' : '♡ Favourite'}</button>
            <button className={`btn small ${saved.watchlist ? '' : 'ghost'}`} onClick={() => toggleSave('watchlist')}>{saved.watchlist ? '✓ In watchlist' : '+ Watchlist'}</button>
            {movie.trailerUrl && <a className="btn small ghost" href={movie.trailerUrl} target="_blank" rel="noreferrer">▶ Trailer</a>}
          </div>
        </div>
      </section>

      <Message>{error}</Message>
      <Message type="success">{info}</Message>

      <section>
        <h2>Book tickets</h2>
        {shows.length === 0 ? (
          <p className="muted">{movie.status === 'upcoming' ? 'Bookings are not open yet. Add it to your watchlist and we will email you when shows are added.' : 'No upcoming shows for this movie.'}</p>
        ) : (
          <>
            <div className="row gap wrap">
              <div className="tabs">
                {days.map((d) => <button key={d} className={d === activeDay ? 'active' : ''} onClick={() => setDay(d)}>{fmtDate(d + 'T12:00:00')}</button>)}
              </div>
              {cities.length > 1 && (
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">All cities</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              )}
            </div>
            {Object.values(byTheatre).map(({ theatre, shows: list }) => (
              <div className="card pad" key={theatre._id}>
                <h3>{theatre.name} <span className="muted small-text">{theatre.city}{theatre.address ? ` · ${theatre.address}` : ''}</span></h3>
                <div className="row gap wrap">
                  {list.map((s) => (
                    <Link key={s._id} to={`/shows/${s._id}/seats`} className="show-btn">
                      <b>{fmtTime(s.startTime)}</b>
                      <small>{s.screenName} · from {money(Math.min(...Object.values(s.prices)))}</small>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      <section>
        <h2>Reviews</h2>
        {user?.role === 'user' && !myReview && (
          <form className="card pad" onSubmit={submitReview}>
            <label>Your rating
              <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
              </select>
            </label>
            <label>Comment<textarea rows={3} maxLength={1000} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} /></label>
            <button className="btn small">Post review</button>
          </form>
        )}
        {!user && <p className="muted"><Link to="/login" state={{ from: `/movie/${id}` }}>Login</Link> to write a review.</p>}
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.map((r) => (
          <div className="card pad" key={r._id}>
            <div className="row between">
              <b>{r.user?.name || 'User'} <span className="rating">{'★'.repeat(r.rating)}</span></b>
              {(user?.role === 'admin' || r.user?._id === user?._id) && <button className="btn small danger" onClick={() => deleteReview(r._id)}>Delete</button>}
            </div>
            <p>{r.comment}</p>
            <small className="muted">{fmtDate(r.createdAt)}</small>
          </div>
        ))}
      </section>
    </main>
  )
}

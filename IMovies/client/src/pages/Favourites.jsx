import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import MovieCard from '../components/MovieCard'
import Message from '../components/Message'

export default function Favourites() {
  const [type, setType] = useState('favourite')
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => api.get(`/favourites?type=${type}`).then((d) => setItems(d.items)).catch((e) => setError(e.message)), [type])
  useEffect(() => { load() }, [load])

  const remove = async (movieId) => {
    try { await api.del(`/favourites/${movieId}?type=${type}`); load() } catch (e) { setError(e.message) }
  }

  return (
    <main className="container">
      <h1>My lists</h1>
      <div className="tabs">
        <button className={type === 'favourite' ? 'active' : ''} onClick={() => { setItems(null); setType('favourite') }}>Favourites</button>
        <button className={type === 'watchlist' ? 'active' : ''} onClick={() => { setItems(null); setType('watchlist') }}>Watchlist</button>
      </div>
      <Message>{error}</Message>
      {!items ? <p className="muted center">Loading...</p> : items.length === 0 ? <p className="muted">Nothing here yet.</p> : (
        <div className="grid">
          {items.map((i) => (
            <div key={i._id}>
              <MovieCard movie={i.movie} />
              <button className="btn small danger block" onClick={() => remove(i.movie._id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

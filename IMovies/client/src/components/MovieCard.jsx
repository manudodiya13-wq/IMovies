import { Link } from 'react-router-dom'
import { runtime } from '../utils'

export function Poster({ movie, className = '' }) {
  if (movie.poster) return <img className={`poster ${className}`} src={movie.poster} alt={movie.title} />
  return <div className={`poster fallback ${className}`}>{movie.title?.[0] || '?'}</div>
}

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie._id}`} className="card movie-card">
      <Poster movie={movie} />
      <div className="card-body">
        <h3>{movie.title}</h3>
        <p className="muted">{movie.genre?.join(' • ')}</p>
        <div className="row between">
          <span className="rating">★ {movie.ratingCount ? movie.averageRating : 'New'}</span>
          <span className="muted small-text">{runtime(movie.duration)}</span>
        </div>
        {movie.status === 'upcoming' && <span className="badge">Coming soon</span>}
      </div>
    </Link>
  )
}

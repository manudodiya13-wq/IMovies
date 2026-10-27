import { useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'
import { money } from '../../utils'

export default function Dashboard() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/admin/dashboard').then(setD).catch((e) => setError(e.message)) }, [])

  if (!d) return <>{error ? <Message>{error}</Message> : <p className="muted">Loading...</p>}</>
  const { stats, topMovies, last7Days } = d
  const maxRev = Math.max(1, ...last7Days.map((x) => x.revenue))
  const cards = [
    ['Revenue', money(stats.totalRevenue)], ['Tickets sold', stats.ticketsSold], ['Users', stats.users],
    ['Movies', stats.movies], ['Theatres', stats.theatres], ['Upcoming shows', stats.upcomingShows],
  ]

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stat-grid">{cards.map(([k, v]) => <div className="card pad stat" key={k}><small>{k}</small><b>{v}</b></div>)}</div>

      <div className="two-col">
        <div className="card pad">
          <h3>Bookings by status</h3>
          {Object.keys(stats.bookingsByStatus).length === 0 && <p className="muted">No bookings yet.</p>}
          {Object.entries(stats.bookingsByStatus).map(([s, c]) => <p key={s}><span className={`status ${s}`}>{s}</span> {c}</p>)}
        </div>
        <div className="card pad">
          <h3>Top movies by revenue</h3>
          {topMovies.length === 0 && <p className="muted">No paid bookings yet.</p>}
          {topMovies.map((m) => <p key={m.movieId} className="row between"><span>{m.title}</span><b>{money(m.revenue)} · {m.tickets} tickets</b></p>)}
        </div>
      </div>

      <div className="card pad">
        <h3>Last 7 days</h3>
        {last7Days.length === 0 && <p className="muted">No confirmed bookings in the last 7 days.</p>}
        {last7Days.map((x) => (
          <div className="bar-row" key={x.date}>
            <span>{x.date}</span>
            <div className="bar"><i style={{ width: `${(x.revenue / maxRev) * 100}%` }} /></div>
            <b>{money(x.revenue)} ({x.bookings})</b>
          </div>
        ))}
      </div>
    </>
  )
}

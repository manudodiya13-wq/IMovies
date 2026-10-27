import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Message from '../components/Message'
import { fmtDateTime, money } from '../utils'

const STATUSES = ['', 'confirmed', 'pending', 'cancelled', 'expired']

export default function MyBookings() {
  const [status, setStatus] = useState('')
  const [bookings, setBookings] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/bookings/my' + (status ? `?status=${status}` : '')).then((d) => setBookings(d.bookings)).catch((e) => setError(e.message))
  }, [status])

  return (
    <main className="container">
      <h1>My bookings</h1>
      <div className="tabs">
        {STATUSES.map((s) => <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s || 'All'}</button>)}
      </div>
      <Message>{error}</Message>
      {!bookings ? <p className="muted center">Loading...</p> : bookings.length === 0 ? <p className="muted">No bookings found.</p> : (
        bookings.map((b) => (
          <Link to={`/booking/${b._id}`} className="card pad booking-row" key={b._id}>
            <div>
              <h3>{b.movie?.title}</h3>
              <p className="muted">{b.theatre?.name}, {b.theatre?.city} · {fmtDateTime(b.show?.startTime)}</p>
              <p>Seats: {b.seats.map((s) => s.seatId).join(', ')} · {b.bookingCode}</p>
            </div>
            <div className="right">
              <span className={`status ${b.status}`}>{b.status}</span>
              <b>{money(b.totalAmount)}</b>
            </div>
          </Link>
        ))
      )}
    </main>
  )
}

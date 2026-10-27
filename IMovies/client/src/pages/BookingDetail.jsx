import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Message from '../components/Message'
import { fmtDateTime, money } from '../utils'

export default function BookingDetail() {
  const { id } = useParams()
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    api.get(`/bookings/${id}`).then((d) => setBooking(d.booking)).catch((e) => setError(e.message))
  }, [id])

  const cancel = async () => {
    if (!window.confirm('Cancel this booking?')) return
    setError('')
    try {
      const d = await api.put(`/bookings/${id}/cancel`)
      setBooking({ ...booking, ...d.booking, movie: booking.movie, theatre: booking.theatre, show: booking.show })
      setInfo(d.message)
    } catch (err) { setError(err.message) }
  }

  if (!booking) return <main className="container">{error ? <Message>{error}</Message> : <p className="muted center">Loading...</p>}</main>

  return (
    <main className="container narrow">
      <Message>{error}</Message>
      <Message type="success">{info}</Message>
      <div className="ticket">
        <div className="ticket-head">
          <span>iMovies e-ticket</span>
          <span className={`status ${booking.status}`}>{booking.status}</span>
        </div>
        <h2>{booking.movie.title}</h2>
        <p className="muted">{booking.theatre.name}, {booking.theatre.city}{booking.theatre.address ? ` · ${booking.theatre.address}` : ''}</p>
        <div className="ticket-grid">
          <div><small>Booking ID</small><b>{booking.bookingCode}</b></div>
          <div><small>Show time</small><b>{fmtDateTime(booking.show.startTime)}</b></div>
          <div><small>Screen</small><b>{booking.show.screenName}</b></div>
          <div><small>Seats</small><b>{booking.seats.map((s) => s.seatId).join(', ')}</b></div>
          <div><small>Amount</small><b>{money(booking.totalAmount)}</b></div>
          <div><small>Payment</small><b>{booking.payment?.status}{booking.payment?.method ? ` (${booking.payment.method})` : ''}</b></div>
          {booking.payment?.transactionId && <div><small>Transaction ID</small><b>{booking.payment.transactionId}</b></div>}
        </div>
      </div>
      <div className="row gap">
        {booking.status === 'pending' && <Link className="btn" to={`/booking/${id}/pay`}>Complete payment</Link>}
        {booking.status === 'confirmed' && <button className="btn ghost" onClick={() => window.print()}>Print ticket</button>}
        {['pending', 'confirmed'].includes(booking.status) && <button className="btn danger" onClick={cancel}>Cancel booking</button>}
        <Link className="btn ghost" to="/my-bookings">All bookings</Link>
      </div>
    </main>
  )
}

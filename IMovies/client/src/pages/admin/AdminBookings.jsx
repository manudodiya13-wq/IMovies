import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'
import { fmtDateTime, money } from '../../utils'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page, limit: 15 })
    if (status) qs.set('status', status)
    return api.get('/admin/bookings?' + qs).then((d) => { setBookings(d.bookings); setPages(d.pages) }).catch((e) => setError(e.message))
  }, [page, status])
  useEffect(() => { load() }, [load])

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking (refund if paid)?')) return
    setError('')
    try { await api.put(`/bookings/${id}/cancel`); load() } catch (e) { setError(e.message) }
  }

  return (
    <>
      <h1>All bookings</h1>
      <div className="tabs">
        {['', 'confirmed', 'pending', 'cancelled', 'expired'].map((s) => (
          <button key={s} className={status === s ? 'active' : ''} onClick={() => { setStatus(s); setPage(1) }}>{s || 'All'}</button>
        ))}
      </div>
      <Message>{error}</Message>
      <table>
        <thead><tr><th>Code</th><th>User</th><th>Movie</th><th>Theatre</th><th>Show</th><th>Seats</th><th>Amount</th><th>Status</th><th /></tr></thead>
        <tbody>
          {bookings.length === 0 && <tr><td colSpan={9} className="muted">No bookings.</td></tr>}
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.bookingCode}</td><td>{b.user?.name}<br /><small className="muted">{b.user?.email}</small></td>
              <td>{b.movie?.title}</td><td>{b.theatre?.name}</td><td>{b.show ? fmtDateTime(b.show.startTime) : '-'}</td>
              <td>{b.seats.map((s) => s.seatId).join(', ')}</td><td>{money(b.totalAmount)}</td>
              <td><span className={`status ${b.status}`}>{b.status}</span></td>
              <td className="actions">{['pending', 'confirmed'].includes(b.status) && <button className="btn small danger" onClick={() => cancel(b._id)}>Cancel</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && (
        <div className="pager">
          <button className="btn small ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button className="btn small ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Message from '../components/Message'
import { fmtDateTime, money } from '../utils'

const MAX_SEATS = 10

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api.get(`/shows/${id}`).then(setData).catch((e) => setError(e.message)), [id])
  useEffect(() => { load() }, [load])

  if (!data) return <main className="container">{error ? <Message>{error}</Message> : <p className="muted center">Loading seats...</p>}</main>

  const { show, seatMap } = data
  const priceOf = (seatId) => seatMap.find((r) => r.seats.some((s) => s.seatId === seatId))?.price || 0
  const total = selected.reduce((sum, s) => sum + priceOf(s), 0)

  const toggle = (seat) => {
    if (seat.status === 'booked') return
    setError('')
    if (selected.includes(seat.seatId)) return setSelected(selected.filter((s) => s !== seat.seatId))
    if (selected.length >= MAX_SEATS) return setError(`You can select at most ${MAX_SEATS} seats`)
    setSelected([...selected, seat.seatId])
  }

  const proceed = async () => {
    setBusy(true)
    setError('')
    try {
      const d = await api.post('/bookings', { showId: id, seats: selected })
      navigate(`/booking/${d.booking._id}/pay`)
    } catch (err) {
      setError(err.message)
      setSelected([])
      load() // seats may have been taken meanwhile
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container">
      <h1>{show.movie.title}</h1>
      <p className="muted">{show.theatre.name}, {show.theatre.city} · {show.screenName} · {fmtDateTime(show.startTime)}</p>
      <Message>{error}</Message>

      <div className="screen-bar">SCREEN THIS WAY</div>
      <div className="seatmap">
        {seatMap.map((row) => (
          <div className="seat-row" key={row.row}>
            <span className="row-label">{row.row}</span>
            <div className="seats">
              {row.seats.map((seat) => (
                <button
                  key={seat.seatId}
                  title={`${seat.seatId} · ${row.type} · ${money(row.price)}`}
                  className={`seat ${row.type.toLowerCase()} ${seat.status} ${selected.includes(seat.seatId) ? 'selected' : ''}`}
                  disabled={seat.status === 'booked'}
                  onClick={() => toggle(seat)}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            <span className="row-type">{row.type} · {money(row.price)}</span>
          </div>
        ))}
      </div>

      <div className="legend">
        <span><i className="seat" /> Available</span>
        <span><i className="seat selected" /> Selected</span>
        <span><i className="seat booked" /> Booked</span>
      </div>

      <div className="checkout-bar">
        <div>
          {selected.length ? <><b>{selected.join(', ')}</b><br /><span className="muted">{selected.length} seat(s)</span></> : <span className="muted">Select your seats ({data.availableSeats} available)</span>}
        </div>
        <button className="btn" disabled={!selected.length || busy} onClick={proceed}>{busy ? 'Holding seats...' : `Pay ${money(total)}`}</button>
      </div>
    </main>
  )
}

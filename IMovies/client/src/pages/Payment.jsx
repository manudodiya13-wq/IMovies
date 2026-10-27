import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import Message from '../components/Message'
import { fmtDateTime, money } from '../utils'

const METHODS = [
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'netbanking', label: 'Net Banking' },
  { id: 'wallet', label: 'Wallet' },
]

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [method, setMethod] = useState('card')
  const [details, setDetails] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '', upiId: '', bank: 'HDFC Bank', wallet: 'Paytm' })
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/bookings/${id}`).then((d) => {
      if (d.booking.status === 'confirmed') return navigate(`/booking/${id}`, { replace: true })
      setBooking(d.booking)
    }).catch((e) => setError(e.message))
  }, [id, navigate])

  useEffect(() => {
    if (!booking?.expiresAt) return
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((new Date(booking.expiresAt) - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [booking])

  const set = (k) => (e) => setDetails({ ...details, [k]: e.target.value })
  const expired = secondsLeft === 0 || booking?.status === 'expired' || booking?.status === 'cancelled'

  const pay = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post(`/bookings/${id}/pay`, { method, details })
      navigate(`/booking/${id}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const release = async () => {
    try {
      await api.put(`/bookings/${id}/cancel`)
      navigate('/my-bookings')
    } catch (err) { setError(err.message) }
  }

  if (!booking) return <main className="container">{error ? <Message>{error}</Message> : <p className="muted center">Loading...</p>}</main>
  const mm = String(Math.floor((secondsLeft ?? 0) / 60)).padStart(2, '0')
  const ss = String((secondsLeft ?? 0) % 60).padStart(2, '0')

  return (
    <main className="container narrow">
      <h1>Complete payment</h1>
      <div className="card pad">
        <h3>{booking.movie.title}</h3>
        <p className="muted">{booking.theatre.name}, {booking.theatre.city} · {booking.show.screenName} · {fmtDateTime(booking.show.startTime)}</p>
        <p>Seats: <b>{booking.seats.map((s) => s.seatId).join(', ')}</b></p>
        <p className="total">Amount: {money(booking.totalAmount)}</p>
        {expired ? <Message>Your seat hold has expired. Please select seats again.</Message> : <p className="timer">Seats held for {mm}:{ss}</p>}
      </div>

      <Message>{error}</Message>
      <form className="card pad" onSubmit={pay}>
        <div className="tabs">
          {METHODS.map((m) => <button type="button" key={m.id} className={method === m.id ? 'active' : ''} onClick={() => setMethod(m.id)}>{m.label}</button>)}
        </div>

        {method === 'card' && (
          <>
            <label>Card number (16 digits)<input required inputMode="numeric" maxLength={19} placeholder="4111 1111 1111 1111" value={details.cardNumber} onChange={set('cardNumber')} /></label>
            <label>Name on card<input required value={details.cardName} onChange={set('cardName')} /></label>
            <div className="row gap">
              <label className="grow">Expiry<input required placeholder="MM/YY" maxLength={5} value={details.expiry} onChange={set('expiry')} /></label>
              <label className="grow">CVV<input required type="password" maxLength={4} value={details.cvv} onChange={set('cvv')} /></label>
            </div>
            <p className="muted small-text">Demo gateway: any 16-digit number works. A card ending in 0000 is declined.</p>
          </>
        )}
        {method === 'upi' && <label>UPI ID<input required placeholder="name@upi" value={details.upiId} onChange={set('upiId')} /></label>}
        {method === 'netbanking' && (
          <label>Choose bank
            <select value={details.bank} onChange={set('bank')}>{['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map((b) => <option key={b}>{b}</option>)}</select>
          </label>
        )}
        {method === 'wallet' && (
          <label>Choose wallet
            <select value={details.wallet} onChange={set('wallet')}>{['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map((b) => <option key={b}>{b}</option>)}</select>
          </label>
        )}

        <div className="row gap">
          <button className="btn grow" disabled={busy || expired}>{busy ? 'Processing...' : `Pay ${money(booking.totalAmount)}`}</button>
          <button type="button" className="btn ghost" onClick={release}>Cancel</button>
        </div>
      </form>
    </main>
  )
}

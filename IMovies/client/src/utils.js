export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
export const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`
export const dayKey = (d) => new Date(d).toLocaleDateString('en-CA') // YYYY-MM-DD in local time
export const runtime = (m) => `${Math.floor(m / 60)}h ${m % 60}m`
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export default function Message({ type = 'error', children }) {
  if (!children) return null
  return <div className={`msg ${type}`}>{children}</div>
}

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// <ProtectedRoute role="user"> or role="admin"
export default function ProtectedRoute({ role = 'user', children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="center muted">Loading...</div>
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to={role === 'admin' ? '/admin/login' : '/'} replace />
  return children
}

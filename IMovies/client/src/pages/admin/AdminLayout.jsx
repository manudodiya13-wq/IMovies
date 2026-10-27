import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const out = async () => { await logout(); navigate('/admin/login') }

  return (
    <div className="admin">
      <aside>
        <div className="logo">i<span>Movies</span> <small>Admin</small></div>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/movies">Movies</NavLink>
        <NavLink to="/admin/theatres">Theatres &amp; Screens</NavLink>
        <NavLink to="/admin/shows">Shows</NavLink>
        <NavLink to="/admin/users">Users</NavLink>
        <NavLink to="/admin/bookings">Bookings</NavLink>
        <div className="spacer" />
        <small className="muted">{user.email}</small>
        <NavLink to="/">View website</NavLink>
        <button className="btn small ghost" onClick={out}>Logout</button>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  )
}

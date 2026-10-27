import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const onSearch = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : '/')
  }
  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">i<span>Movies</span></Link>
      <form onSubmit={onSearch} className="search">
        <input placeholder="Search movies..." value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        {user?.role === 'user' && (
          <>
            <NavLink to="/my-bookings">My Bookings</NavLink>
            <NavLink to="/favourites">Favourites</NavLink>
            <NavLink to="/profile">{user.name.split(' ')[0]}</NavLink>
          </>
        )}
        {user?.role === 'admin' && <NavLink to="/admin">Admin Panel</NavLink>}
        {user ? (
          <button className="btn small ghost" onClick={onLogout}>Logout</button>
        ) : (
          <>
            <Link className="btn small ghost" to="/login">Login</Link>
            <Link className="btn small" to="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

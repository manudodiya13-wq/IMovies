import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import BookingDetail from './pages/BookingDetail'
import MyBookings from './pages/MyBookings'
import Favourites from './pages/Favourites'
import Profile from './pages/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminTheatres from './pages/admin/AdminTheatres'
import AdminShows from './pages/admin/AdminShows'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBookings from './pages/admin/AdminBookings'

export default function App() {
  const { pathname } = useLocation()
  const isAdminArea = pathname.startsWith('/admin')
  const user = (el) => <ProtectedRoute role="user">{el}</ProtectedRoute>

  return (
    <>
      {!isAdminArea && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/shows/:id/seats" element={user(<SeatSelection />)} />
        <Route path="/booking/:id/pay" element={user(<Payment />)} />
        <Route path="/booking/:id" element={user(<BookingDetail />)} />
        <Route path="/my-bookings" element={user(<MyBookings />)} />
        <Route path="/favourites" element={user(<Favourites />)} />
        <Route path="/profile" element={user(<Profile />)} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="theatres" element={<AdminTheatres />} />
          <Route path="shows" element={<AdminShows />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

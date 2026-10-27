import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { _id, name, email, phone, role: 'user' | 'admin' }
  const [loading, setLoading] = useState(true)

  // restore the session from the cookie on page load
  useEffect(() => {
    api
      .get('/auth/me')
      .then((d) => setUser({ ...d.user, role: d.role }))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password })
    setUser(d.user)
    return d.user
  }
  const register = async (form) => {
    const d = await api.post('/auth/register', form)
    setUser(d.user)
    return d.user
  }
  const adminLogin = async (email, password) => {
    const d = await api.post('/admin/login', { email, password })
    setUser(d.user)
    return d.user
  }
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

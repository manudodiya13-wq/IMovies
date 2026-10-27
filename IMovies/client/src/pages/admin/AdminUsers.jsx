import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import Message from '../../components/Message'
import { fmtDate } from '../../utils'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page, limit: 15 })
    if (search) qs.set('search', search)
    return api.get('/admin/users?' + qs).then((d) => { setUsers(d.users); setPages(d.pages) }).catch((e) => setError(e.message))
  }, [page, search])
  useEffect(() => { load() }, [load])

  const toggle = async (u) => {
    setError('')
    try { await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive }); load() } catch (e) { setError(e.message) }
  }
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return
    setError('')
    try { await api.del(`/admin/users/${u._id}`); load() } catch (e) { setError(e.message) }
  }

  return (
    <>
      <h1>Users</h1>
      <input className="inline-search" placeholder="Search name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      <Message>{error}</Message>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td><td>{fmtDate(u.createdAt)}</td>
              <td><span className={`status ${u.isActive ? 'confirmed' : 'cancelled'}`}>{u.isActive ? 'active' : 'blocked'}</span></td>
              <td className="actions">
                <button className="btn small ghost" onClick={() => toggle(u)}>{u.isActive ? 'Block' : 'Unblock'}</button>
                <button className="btn small danger" onClick={() => remove(u)}>Delete</button>
              </td>
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

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Fetch user data
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login')
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav style={{
        background: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a1a2e' }}>BVRIT Weekly Reports</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user.name}</span>
          <button onClick={handleLogout} style={{
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </nav>
      <div style={{ padding: '2rem' }}>
        <h2>Dashboard</h2>
        <p>Welcome, {user.name}!</p>
        <p>Role: {user.role}</p>
        <p>Department: {user.department?.name || 'Not selected'}</p>
      </div>
    </div>
  )
}

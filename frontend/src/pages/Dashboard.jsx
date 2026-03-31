import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const SECTIONS = [
  'generalPoints', 'facultyJoined', 'facultyAchievements', 'studentAchievements',
  'departmentAchievements', 'facultyEvents', 'studentEvents', 'nonTechEvents',
  'industryVisits', 'hackathons', 'facultyFDP', 'facultyVisits', 'patents',
  'vedicProgramsStudents', 'vedicProgramsFaculty', 'placements', 'mous', 'skillDevelopment'
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => navigate('/login'))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem' }}>BVRIT Weekly Reports</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user.name} ({user.role})</span>
          {user.role === 'admin' && <Link to="/admin" style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '0.25rem' }}>Admin Panel</Link>}
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem' }}>
        <h2>18 Data Entry Sections</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {SECTIONS.map((section, i) => (
            <div key={section} style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{i + 1}. {section}</h3>
              <Link to={`/section/${section}`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: '#4285f4', color: 'white', textDecoration: 'none', borderRadius: '0.25rem' }}>
                Add Entry
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { SECTION_DEFINITIONS } from '../constants/sections'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [departments, setDepartments] = useState([])
  const [sections, setSections] = useState([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedSectionKey, setSelectedSectionKey] = useState('')
  const [isSavingDepartment, setIsSavingDepartment] = useState(false)

  const sectionsByKey = useMemo(
    () => new Map(SECTION_DEFINITIONS.map((section) => [section.key, section])),
    []
  )

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    Promise.all([
      api.get('/auth/me'),
      api.get('/departments'),
      api.get('/sections/catalog')
    ])
      .then(([userResponse, departmentResponse, sectionResponse]) => {
        const me = userResponse.data
        const deptList = departmentResponse.data || []
        const sectionList = sectionResponse.data || []

        setUser(me)
        setDepartments(deptList)
        setSections(sectionList)

        const preferredDepartmentId =
          me.departmentId?.toString() || deptList[0]?.id?.toString() || ''
        setSelectedDepartmentId(preferredDepartmentId)
        setSelectedSectionKey(sectionList[0]?.key || '')
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleDepartmentChange = async (event) => {
    const nextDepartmentId = event.target.value
    setSelectedDepartmentId(nextDepartmentId)

    if (!nextDepartmentId || !user || user.role === 'admin') return

    setIsSavingDepartment(true)
    try {
      await api.put('/users/select-department', { departmentId: Number(nextDepartmentId) })
      setUser((prev) => ({ ...prev, departmentId: Number(nextDepartmentId) }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save department selection')
    } finally {
      setIsSavingDepartment(false)
    }
  }

  const openSectionForm = () => {
    if (!selectedDepartmentId) {
      toast.error('Please select a department first')
      return
    }
    if (!selectedSectionKey) {
      toast.error('Please select a section first')
      return
    }

    navigate(`/section/${selectedSectionKey}?departmentId=${selectedDepartmentId}`)
  }

  if (!user) return <div>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <nav
        style={{
          background: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1 style={{ fontSize: '1.5rem' }}>BVRIT Weekly Reports</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{user.name} ({user.role})</span>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                padding: '0.5rem 1rem',
                background: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.25rem'
              }}
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '920px', margin: '0 auto' }}>
        <h2>Data Entry</h2>
        <p style={{ color: '#666', marginBottom: '1.2rem' }}>
          Select department and section, then enter report data.
        </p>

        <div
          style={{
            background: 'white',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem' }}>Department</label>
              <select
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.4rem', border: '1px solid #d6d6d6' }}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem' }}>Section</label>
              <select
                value={selectedSectionKey}
                onChange={(event) => setSelectedSectionKey(event.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '0.4rem', border: '1px solid #d6d6d6' }}
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.key}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openSectionForm}
              disabled={!selectedDepartmentId || !selectedSectionKey || isSavingDepartment}
              style={{
                padding: '0.75rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.4rem',
                cursor: (!selectedDepartmentId || !selectedSectionKey || isSavingDepartment) ? 'not-allowed' : 'pointer',
                opacity: (!selectedDepartmentId || !selectedSectionKey || isSavingDepartment) ? 0.7 : 1
              }}
            >
              {isSavingDepartment ? 'Saving Department...' : 'Open Section Form'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.3rem', background: 'white', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3 style={{ marginBottom: '0.6rem' }}>Active Sections</h3>
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            {sections.map((section) => (
              <div key={section.id} style={{ padding: '0.6rem', border: '1px solid #ececec', borderRadius: '0.35rem' }}>
                {sectionsByKey.get(section.key)?.label || section.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

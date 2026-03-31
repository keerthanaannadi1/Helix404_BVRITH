import { useState, useEffect } from 'react'
import api from '../api/axios'
import { toast } from 'react-toastify'

export default function AdminPanel() {
  const [departments, setDepartments] = useState([])
  const [newDept, setNewDept] = useState({ name: '', code: '' })

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data))
  }, [])

  const addDepartment = async (e) => {
    e.preventDefault()
    try {
      await api.post('/departments', newDept)
      toast.success('Department added!')
      setNewDept({ name: '', code: '' })
      api.get('/departments').then(res => setDepartments(res.data))
    } catch (error) {
      toast.error('Failed to add department')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Panel</h2>
      <div style={{ marginTop: '2rem', background: 'white', padding: '2rem', borderRadius: '0.5rem' }}>
        <h3>Add Department</h3>
        <form onSubmit={addDepartment} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input placeholder="Name" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} style={{ padding: '0.5rem', flex: 1 }} />
          <input placeholder="Code" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} style={{ padding: '0.5rem', width: '100px' }} />
          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Add</button>
        </form>
        <h3 style={{ marginTop: '2rem' }}>Departments</h3>
        <ul style={{ marginTop: '1rem' }}>
          {departments.map(dept => (
            <li key={dept.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              {dept.name} ({dept.code})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

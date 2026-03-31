import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { toast } from 'react-toastify'
import { SECTION_DEFINITIONS } from '../constants/sections'

function currentMonth() {
  const now = new Date()
  return String(now.getMonth() + 1).padStart(2, '0')
}

function currentYear() {
  return String(new Date().getFullYear())
}

function currentDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminPanel() {
  const [departments, setDepartments] = useState([])
  const [sections, setSections] = useState([])
  const [newDept, setNewDept] = useState({ name: '', code: '' })
  const [newSection, setNewSection] = useState({ key: '', label: '' })
  const [downloadingType, setDownloadingType] = useState('')
  const [reportForm, setReportForm] = useState({
    weekStart: currentDate(),
    weekEnd: currentDate(),
    month: currentMonth(),
    year: currentYear(),
    departmentId: ''
  })

  const sectionOptions = useMemo(
    () => SECTION_DEFINITIONS.filter((definition) => !sections.find((section) => section.key === definition.key)),
    [sections]
  )

  const loadData = async () => {
    try {
      const [departmentsResponse, sectionsResponse] = await Promise.all([
        api.get('/departments'),
        api.get('/sections/catalog')
      ])
      setDepartments(departmentsResponse.data || [])
      setSections(sectionsResponse.data || [])
    } catch (error) {
      toast.error('Failed to load admin data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const addDepartment = async (event) => {
    event.preventDefault()
    try {
      await api.post('/departments', newDept)
      toast.success('Department added')
      setNewDept({ name: '', code: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add department')
    }
  }

  const addSection = async (event) => {
    event.preventDefault()
    if (!newSection.key || !newSection.label) {
      toast.error('Please select section key and label')
      return
    }

    try {
      await api.post('/sections/catalog', newSection)
      toast.success('Section added')
      setNewSection({ key: '', label: '' })
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add section')
    }
  }

  const removeSection = async (sectionId) => {
    try {
      await api.delete(`/sections/catalog/${sectionId}`)
      toast.success('Section removed')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove section')
    }
  }

  const downloadReport = async (type) => {
    setDownloadingType(type)
    try {
      const payload = {}
      const selectedDepartment = reportForm.departmentId ? Number(reportForm.departmentId) : undefined
      if (selectedDepartment) payload.departmentId = selectedDepartment

      if (type === 'weekly') {
        payload.weekStart = reportForm.weekStart
        payload.weekEnd = reportForm.weekEnd
      } else if (type === 'monthly') {
        payload.month = Number(reportForm.month)
        payload.year = Number(reportForm.year)
      } else {
        payload.year = Number(reportForm.year)
      }

      const response = await api.post(`/reports/generate/${type}`, payload, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${type}-report.docx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${type} report downloaded`)
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to download ${type} report`)
    } finally {
      setDownloadingType('')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '980px', margin: '0 auto' }}>
      <h2>Admin Panel</h2>

      <div style={{ marginTop: '1.5rem', background: 'white', padding: '1.4rem', borderRadius: '0.5rem' }}>
        <h3>Add Department</h3>
        <form onSubmit={addDepartment} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <input
            placeholder="Name"
            value={newDept.name}
            onChange={(event) => setNewDept({ ...newDept, name: event.target.value })}
            style={{ padding: '0.6rem', flex: 1 }}
          />
          <input
            placeholder="Code"
            value={newDept.code}
            onChange={(event) => setNewDept({ ...newDept, code: event.target.value })}
            style={{ padding: '0.6rem', width: '130px' }}
          />
          <button type="submit" style={{ padding: '0.6rem 1rem', background: '#1f7a1f', color: '#fff', border: 'none', borderRadius: '0.25rem' }}>
            Add
          </button>
        </form>
        <div style={{ marginTop: '1rem' }}>
          {departments.map((department) => (
            <div key={department.id} style={{ padding: '0.45rem 0', borderBottom: '1px solid #eee' }}>
              {department.name} ({department.code})
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', background: 'white', padding: '1.4rem', borderRadius: '0.5rem' }}>
        <h3>Manage Sections</h3>
        <form onSubmit={addSection} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={newSection.key}
            onChange={(event) => {
              const definition = SECTION_DEFINITIONS.find((section) => section.key === event.target.value)
              setNewSection({
                key: event.target.value,
                label: definition?.label || ''
              })
            }}
            style={{ padding: '0.6rem', minWidth: '260px' }}
          >
            <option value="">Select section key</option>
            {sectionOptions.map((option) => (
              <option key={option.key} value={option.key}>{option.key}</option>
            ))}
          </select>
          <input
            placeholder="Section label"
            value={newSection.label}
            onChange={(event) => setNewSection({ ...newSection, label: event.target.value })}
            style={{ padding: '0.6rem', flex: 1, minWidth: '260px' }}
          />
          <button type="submit" style={{ padding: '0.6rem 1rem', background: '#1f7a1f', color: '#fff', border: 'none', borderRadius: '0.25rem' }}>
            Add
          </button>
        </form>
        <div style={{ marginTop: '1rem' }}>
          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                padding: '0.45rem 0',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <span>{section.label} ({section.key})</span>
              <button
                onClick={() => removeSection(section.id)}
                style={{ padding: '0.35rem 0.7rem', border: 'none', borderRadius: '0.25rem', background: '#dc2626', color: '#fff' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', background: 'white', padding: '1.4rem', borderRadius: '0.5rem' }}>
        <h3>Download Reports</h3>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label>Department (optional)</label>
            <select
              value={reportForm.departmentId}
              onChange={(event) => setReportForm({ ...reportForm, departmentId: event.target.value })}
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Year</label>
            <input
              type="number"
              value={reportForm.year}
              onChange={(event) => setReportForm({ ...reportForm, year: event.target.value })}
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
            />
          </div>
          <div>
            <label>Weekly Start</label>
            <input
              type="date"
              value={reportForm.weekStart}
              onChange={(event) => setReportForm({ ...reportForm, weekStart: event.target.value })}
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
            />
          </div>
          <div>
            <label>Weekly End</label>
            <input
              type="date"
              value={reportForm.weekEnd}
              onChange={(event) => setReportForm({ ...reportForm, weekEnd: event.target.value })}
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
            />
          </div>
          <div>
            <label>Month (1-12)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={reportForm.month}
              onChange={(event) => setReportForm({ ...reportForm, month: event.target.value })}
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => downloadReport('weekly')}
            disabled={downloadingType !== ''}
            style={{ padding: '0.65rem 1rem', border: 'none', borderRadius: '0.3rem', background: '#2563eb', color: '#fff' }}
          >
            {downloadingType === 'weekly' ? 'Downloading...' : 'Download Weekly'}
          </button>
          <button
            onClick={() => downloadReport('monthly')}
            disabled={downloadingType !== ''}
            style={{ padding: '0.65rem 1rem', border: 'none', borderRadius: '0.3rem', background: '#2563eb', color: '#fff' }}
          >
            {downloadingType === 'monthly' ? 'Downloading...' : 'Download Monthly'}
          </button>
          <button
            onClick={() => downloadReport('yearly')}
            disabled={downloadingType !== ''}
            style={{ padding: '0.65rem 1rem', border: 'none', borderRadius: '0.3rem', background: '#2563eb', color: '#fff' }}
          >
            {downloadingType === 'yearly' ? 'Downloading...' : 'Download Yearly'}
          </button>
        </div>
      </div>
    </div>
  )
}

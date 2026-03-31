import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { toast } from 'react-toastify'

const SECTIONS = {
  generalPoints: [
    { name: 'content', label: 'Content', type: 'textarea' },
    { name: 'type', label: 'Type', type: 'select', options: ['meeting', 'announcement', 'other'] }
  ],
  placements: [
    { name: 'companyName', label: 'Company Name', type: 'text' },
    { name: 'studentsPlaced', label: 'Students Placed', type: 'number' },
    { name: 'package', label: 'Package', type: 'text' }
  ],
  studentAchievements: [
    { name: 'studentName', label: 'Student Name', type: 'text' },
    { name: 'rollNo', label: 'Roll Number', type: 'text' },
    { name: 'details', label: 'Details', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' }
  ]
}

export default function SectionForm() {
  const { sectionName } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()
  const [files, setFiles] = useState([])

  const fields = SECTIONS[sectionName] || []

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      Object.keys(data).forEach(key => formData.append(key, data[key]))
      files.forEach(file => formData.append('files', file))
      
      await api.post(`/sections/${sectionName}`, formData)
      toast.success('Entry added successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to add entry')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>{sectionName}</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea {...register(field.name)} style={{ width: '100%', padding: '0.5rem' }} />
            ) : field.type === 'select' ? (
              <select {...register(field.name)} style={{ width: '100%', padding: '0.5rem' }}>
                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={field.type} {...register(field.name)} style={{ width: '100%', padding: '0.5rem' }} />
            )}
          </div>
        ))}
        <div>
          <label>Upload Files (optional)</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
        </div>
        <button type="submit" style={{ padding: '0.75rem', background: '#4285f4', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
          Submit
        </button>
      </form>
    </div>
  )
}

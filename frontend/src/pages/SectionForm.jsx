import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'
import { toast } from 'react-toastify'
import { SECTION_FIELDS, FALLBACK_SECTION_FIELDS } from '../constants/sections'

export default function SectionForm() {
  const { sectionName: sectionFromRoute } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  const [files, setFiles] = useState([])
  const [departments, setDepartments] = useState([])
  const [sections, setSections] = useState([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [selectedSection, setSelectedSection] = useState(sectionFromRoute)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fields = useMemo(
    () => SECTION_FIELDS[selectedSection] || FALLBACK_SECTION_FIELDS,
    [selectedSection]
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const departmentIdFromQuery = params.get('departmentId') || ''
    setSelectedDepartmentId(departmentIdFromQuery)
    setSelectedSection(sectionFromRoute)
  }, [sectionFromRoute])

  useEffect(() => {
    Promise.all([api.get('/departments'), api.get('/sections/catalog')])
      .then(([departmentResponse, sectionResponse]) => {
        setDepartments(departmentResponse.data || [])
        const sectionList = sectionResponse.data || []
        setSections(sectionList)
        if (!selectedSection && sectionList.length) {
          setSelectedSection(sectionList[0].key)
        }
      })
      .catch(() => toast.error('Failed to load form metadata'))
  }, [selectedSection])

  const onSectionChange = (event) => {
    const nextSection = event.target.value
    setSelectedSection(nextSection)
    reset({})
    const query = selectedDepartmentId ? `?departmentId=${selectedDepartmentId}` : ''
    navigate(`/section/${nextSection}${query}`, { replace: true })
  }

  const onDepartmentChange = (event) => {
    const nextDepartment = event.target.value
    setSelectedDepartmentId(nextDepartment)
    const query = nextDepartment ? `?departmentId=${nextDepartment}` : ''
    navigate(`/section/${selectedSection}${query}`, { replace: true })
  }

  const onSubmit = async (data) => {
    if (!selectedDepartmentId) {
      toast.error('Please select a department')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      Object.keys(data).forEach((key) => formData.append(key, data[key]))
      formData.append('departmentId', selectedDepartmentId)
      files.forEach((file) => formData.append('files', file))

      await api.post(`/sections/${selectedSection}`, formData)
      toast.success('Entry added successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Section Data Entry</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Department</label>
          <select
            value={selectedDepartmentId}
            onChange={onDepartmentChange}
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
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
          <label>Section</label>
          <select
            value={selectedSection}
            onChange={onSectionChange}
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.key}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {fields.map((field) => (
          <div key={field.name}>
            <label>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                {...register(field.name, { required: field.required })}
                style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem', minHeight: '92px' }}
              />
            ) : field.type === 'select' ? (
              <select
                {...register(field.name, { required: field.required })}
                style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
              >
                <option value="">Select</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name, { required: field.required })}
                style={{ width: '100%', padding: '0.6rem', marginTop: '0.35rem' }}
              />
            )}
            {errors[field.name] && (
              <p style={{ color: '#b42318', marginTop: '0.25rem', marginBottom: 0 }}>
                This field is required.
              </p>
            )}
          </div>
        ))}

        <div>
          <label>Upload Files (optional)</label>
          <input
            type="file"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files))}
            style={{ display: 'block', marginTop: '0.35rem' }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '0.75rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.35rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.75 : 1
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

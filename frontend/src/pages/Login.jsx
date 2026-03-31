import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const error = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token') || searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, searchParams])

  const handleDomainLogin = async (e) => {
    e.preventDefault()
    setFormError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setFormError('Please enter your email address.')
      return
    }

    if (!normalizedEmail.endsWith('@bvrithyderabad.edu.in')) {
      setFormError('Only @bvrithyderabad.edu.in emails are allowed.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/auth/domain-login', { email: normalizedEmail })
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.response?.data?.message || 'Sign-in failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1a1a2e' }}>
          BVRIT Weekly Reports
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Sign in with your college email (temporary mode)
        </p>
        {(error || formError) && (
          <p style={{
            color: '#b42318',
            background: '#fee4e2',
            border: '1px solid #fecdca',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {formError || (error === 'auth_failed'
              ? 'Sign-in failed. Please try again.'
              : `Sign-in error: ${error}`)}
          </p>
        )}
        <form onSubmit={handleDomainLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@bvrithyderabad.edu.in"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              border: '1px solid #d0d5dd',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              marginBottom: '0.75rem'
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#1d4ed8',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
          Only @bvrithyderabad.edu.in emails allowed
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { UserPlus, Sun, Moon, Eye, EyeOff, GraduationCap, BookOpen } from 'lucide-react'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, fullName, role)
      setSuccess('Account created! Redirecting...')
      setTimeout(() => {
        navigate(role === 'teacher' ? '/teacher' : '/student')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <button className="btn btn-ghost" onClick={toggleTheme} id="auth-theme-toggle">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon-lg">RL</div>
          <h1>Create account</h1>
          <p>Get started with RiskLens</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              className="input"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">I am a...</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
                id="role-student"
              >
                <GraduationCap size={24} style={{ color: role === 'student' ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                <span className="role-name">Student</span>
              </div>
              <div
                className={`role-option ${role === 'teacher' ? 'active' : ''}`}
                onClick={() => setRole('teacher')}
                id="role-teacher"
              >
                <BookOpen size={24} style={{ color: role === 'teacher' ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                <span className="role-name">Teacher</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            id="signup-submit"
          >
            {loading ? <div className="spinner" style={{ borderTopColor: 'white' }}></div> : <UserPlus size={18} />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

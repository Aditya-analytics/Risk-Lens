import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to={profile?.role === 'teacher' ? '/teacher' : '/student'} style={{ textDecoration: 'none' }}>
        <div className="navbar-brand">
          <div className="logo-icon">RL</div>
          <span>RiskLens</span>
        </div>
      </Link>

      <div className="navbar-actions">
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
            <User size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {profile.full_name || profile.email}
            </span>
            <span className={`badge ${profile.role === 'teacher' ? 'badge-info' : 'badge-success'}`}>
              {profile.role}
            </span>
          </div>
        )}

        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user && (
          <button className="btn btn-ghost" onClick={handleLogout} title="Logout" id="logout-btn">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </nav>
  )
}

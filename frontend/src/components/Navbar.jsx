import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, LogOut, User, ChevronLeft, Target } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isDashboard = location.pathname === '/teacher' || location.pathname === '/student'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {isDashboard ? (
          <Link to="/" className="btn btn-ghost btn-sm" style={{ gap: '0.25rem', padding: '0.4rem 0.6rem' }}>
            <ChevronLeft size={16} />
            <span>Exit to Home</span>
          </Link>
        ) : (
          <Link to={profile?.role === 'teacher' ? '/teacher' : '/student'} style={{ textDecoration: 'none' }}>
            <div className="navbar-brand-premium">
              <motion.div
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="logo-dynamic"
              >
                <div className="logo-monogram">RL</div>
              </motion.div>
              <span className="brand-text-premium">Risk<span>Lens</span></span>
              <span className="brand-tagline">Early Detection, Better Outcomes</span>
            </div>
          </Link>
        )}
      </div>

      <div className="navbar-center">
        {isDashboard && (
          <div className="navbar-brand-premium">
            <motion.div
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="logo-dynamic-small"
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>RL</span>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-text-premium small">Risk<span>Lens</span></span>
              <span className="brand-tagline small">Early Detection, Better Outcomes</span>
            </div>
          </div>
        )}
      </div>

      <div className="navbar-actions">
        {profile && (
          <div className="navbar-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
            <div className="user-avatar-mini">
              <User size={14} />
            </div>
            <span className="user-name-text" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {profile.full_name?.split(' ')[0] || profile.email?.split('@')[0]}
            </span>
            <span className={`badge ${profile.role === 'teacher' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              {profile.role}
            </span>
          </div>
        )}

        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          id="theme-toggle"
          style={{ width: 36, height: 36, borderRadius: '50%' }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user && (
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            title="Logout and End Session"
            id="logout-btn"
            style={{ width: 36, height: 36, borderRadius: '50%', color: 'var(--danger)' }}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </nav>
  )
}

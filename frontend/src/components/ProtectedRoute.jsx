import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.role && profile.role !== requiredRole) {
    // Redirect to the correct dashboard based on actual role
    const redirectPath = profile.role === 'teacher' ? '/teacher' : '/student'
    return <Navigate to={redirectPath} replace />
  } else if (requiredRole && !profile?.role) {
    // If user is logged in but has no role (or profile failed to load)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Error</h2>
          <p className="text-gray-400">Your account profile or role could not be loaded.</p>
          <p className="text-gray-400">Please contact support or try logging in again.</p>
        </div>
      </div>
    )
  }

  return children
}

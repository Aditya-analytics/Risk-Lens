import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import Landing from './pages/Landing'

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading RiskLens...</p>
      </div>
    )
  }

  const dashboardPath = profile?.role === 'teacher' ? '/teacher' : '/student'

  return (
    <Routes>
      {/* Landing page — accessible to everyone */}
      <Route
        path="/"
        element={<Landing />}
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={dashboardPath} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={dashboardPath} replace /> : <Signup />}
      />

      {/* Protected routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

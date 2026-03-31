import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Makes an authenticated API request to the FastAPI backend.
 */
async function authFetch(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}

// ── API Methods ─────────────────────────────────────────────────────────────

export const api = {
  /** Get current user profile */
  getProfile: () => authFetch('/me'),

  /** Single student prediction */
  predictSingle: (data) => authFetch('/predict_single', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /** Batch CSV prediction */
  predictCSV: (file, generateInsights = false, departmentId = null) => {
    const formData = new FormData()
    formData.append('file', file)
    let url = `/predict_csv?generate_insights=${generateInsights}`
    if (departmentId) url += `&department_id=${departmentId}`
    return authFetch(url, {
      method: 'POST',
      body: formData,
    })
  },

  /** On-demand AI insights */
  generateInsights: (dashboardMetrics) => authFetch('/insights', {
    method: 'POST',
    body: JSON.stringify(dashboardMetrics),
  }),

  /** On-demand AI insights for a single student */
  generateStudentInsights: (data) => authFetch('/student_insights', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /** Prediction history */
  getHistory: (limit = 20) => authFetch(`/history?limit=${limit}`),

  /** Delete history record */
  deleteHistory: (id) => authFetch(`/history/${id}`, { method: 'DELETE' }),

  /** Departments */
  getDepartments: () => authFetch('/departments'),
  createDepartment: (name, mentor) => authFetch('/departments', { method: 'POST', body: JSON.stringify({ name, mentor }) }),
  deleteDepartment: (id) => authFetch(`/departments/${id}`, { method: 'DELETE' }),
  getDepartmentDashboard: async (id) => {
      // Use standard authFetch mechanism internally to avoid losing the token.
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null;
      try {
        const response = await fetch(`${API_BASE}/departments/${id}/dashboard`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        if (response.status === 204) return null;
        if (!response.ok) return null;
        return response.json();
      } catch (e) {
          return null;
      }
  }
}


import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import {
  Clock, BookOpen, TrendingUp, Smartphone, Users,
  AlertTriangle, CheckCircle, History, Trash2, Activity,
  Send, Sparkles, ArrowLeft, Download
} from 'lucide-react'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    hours_studied: '',
    avg_mid_sem_marks: '',
    avg_prev_sem_marks: '',
    attendance_percentage: '',
    mobile_screen_time_hours: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState(null)
  const [viewTab, setViewTab] = useState('overview') // 'overview', 'ai_insights'

  // Fetch history logic removed per user request

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    setAiInsights(null)
    setViewTab('overview')

    try {
      // Convert strings to numbers
      const payload = {}
      for (const [key, val] of Object.entries(formData)) {
        payload[key] = parseFloat(val)
        if (isNaN(payload[key])) {
          throw new Error(`Invalid value for ${key.replace(/_/g, ' ')}`)
        }
      }
      const data = await api.predictSingle(payload)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  // handleDeleteHistory removed as history is unmaintained

  async function handleGenerateInsights() {
    if (!result) return
    setInsightsLoading(true)
    try {
      const data = await api.generateStudentInsights({
        student_data: formData,
        risk_probability: result.risk_probability,
        prediction: result.prediction
      })
      setAiInsights(data.ai_insights)
    } catch (err) {
      setAiInsights('Failed to generate insights: ' + err.message)
    } finally {
      setInsightsLoading(false)
    }
  }

  function handleDownloadAIInsights() {
    if (!aiInsights) return
    const blob = new Blob([aiInsights], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `My_Action_Plan_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const riskProbability = result?.risk_probability ?? 0
  const isHighRisk = result?.prediction === 1
  const riskPercent = Math.round(riskProbability * 100)

  // Risk color
  const riskColor = riskPercent >= 70 ? 'var(--danger)' : riskPercent >= 40 ? 'var(--warning)' : 'var(--success)'
  const riskBg = riskPercent >= 70 ? 'var(--danger-bg)' : riskPercent >= 40 ? 'var(--warning-bg)' : 'var(--success-bg)'
  const riskLabel = riskPercent >= 70 ? 'High Risk' : riskPercent >= 40 ? 'Moderate Risk' : 'Low Risk'

  const fields = [
    { name: 'hours_studied', label: 'Hours Studied (per day)', icon: <Clock size={18} />, placeholder: 'e.g. 4.5', min: 0, max: 24 },
    { name: 'avg_mid_sem_marks', label: 'Avg Mid-Sem Marks', icon: <BookOpen size={18} />, placeholder: 'e.g. 72', min: 0, max: 100 },
    { name: 'avg_prev_sem_marks', label: 'Avg Prev Sem Marks', icon: <TrendingUp size={18} />, placeholder: 'e.g. 68', min: 0, max: 100 },
    { name: 'attendance_percentage', label: 'Attendance %', icon: <Users size={18} />, placeholder: 'e.g. 85', min: 0, max: 100 },
    { name: 'mobile_screen_time_hours', label: 'Mobile Screen Time (hrs)', icon: <Smartphone size={18} />, placeholder: 'e.g. 3.5', min: 0, max: 24 },
  ]

  if (viewTab === 'ai_insights') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div className="page-container" style={{ flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%', paddingTop: '2.5rem' }}>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => setViewTab('overview')} 
            style={{ marginBottom: '1.5rem', paddingLeft: 0, fontWeight: 500 }}
          >
            <ArrowLeft size={16} style={{ marginRight: '0.25rem' }}/> Back to Dashboard
          </button>
          
          <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="page-title"><Sparkles size={24} style={{ color: 'var(--accent)', marginRight: '0.5rem', display: 'inline' }}/> Personalized AI Plan</h1>
              <p className="page-subtitle">Your custom roadmap to academic success based on your submitted metrics.</p>
            </div>
            {aiInsights && (
              <button className="btn btn-secondary" onClick={handleDownloadAIInsights}>
                <Download size={16} /> Download
              </button>
            )}
          </div>
          
          <div className="card" style={{ padding: '0' }}>
            {insightsLoading ? (
              <div className="empty-state" style={{ padding: '6rem 2rem' }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3.5, marginBottom: '1.5rem', borderTopColor: 'var(--accent)' }}></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Generating your personalized plan...</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>Our AI is analyzing your metrics against historical performance trends.</p>
              </div>
            ) : aiInsights ? (
              <div className="insights-panel" style={{ background: 'transparent', border: 'none', padding: '2rem' }}>
                <ReactMarkdown>{aiInsights}</ReactMarkdown>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '6rem 2rem' }}>
                <Sparkles size={48} style={{ marginBottom: '1rem', color: 'var(--text-tertiary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Plan Generated Yet</h3>
                <p style={{ color: 'var(--text-tertiary)' }}>Please return to the dashboard and click the 'Get Advice' button.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>👋 Hello, {profile?.full_name || 'Student'}</h1>
          <p>Enter your study metrics to check your academic risk level</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left — Self Report Form */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📝 Self Assessment</span>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {fields.map(field => (
                <div className="input-group" key={field.name}>
                  <label className="input-label" htmlFor={field.name}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {field.icon} {field.label}
                    </span>
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    className="input"
                    type="number"
                    step="0.1"
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <button
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={loading}
                id="predict-submit"
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? (
                  <><div className="spinner" style={{ borderTopColor: 'white' }}></div> Analyzing...</>
                ) : (
                  <><Send size={18} /> Check My Risk</>
                )}
              </button>
            </form>
          </div>

          {/* Right — Result + History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Risk Result */}
            {result && (
              <div className="card" style={{ borderColor: riskColor }}>
                <div className="card-header">
                  <span className="card-title">🎯 Your Risk Assessment</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span className={`badge ${isHighRisk ? 'badge-danger' : 'badge-success'}`}>
                      {isHighRisk ? 'At Risk' : 'On Track'}
                    </span>
                    {!aiInsights && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setViewTab('ai_insights')
                          handleGenerateInsights()
                        }}
                        disabled={insightsLoading}
                      >
                        {insightsLoading ? (
                          <><div className="spinner" style={{ borderTopColor: 'white', width: 14, height: 14 }}></div> Generating...</>
                        ) : (
                          <><Sparkles size={14} /> Get Advice</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="risk-gauge">
                  <div
                    className="gauge-circle"
                    style={{
                      background: `conic-gradient(${riskColor} ${riskPercent * 3.6}deg, var(--bg-tertiary) 0deg)`,
                    }}
                  >
                    <div style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '50%',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span className="gauge-value" style={{ color: riskColor }}>{riskPercent}%</span>
                      <span className="gauge-label" style={{ color: riskColor }}>{riskLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Tips based on risk */}
                <div style={{ marginTop: '0.5rem' }}>
                  {isHighRisk ? (
                    <div className="alert alert-error">
                      <AlertTriangle size={16} />
                      <span>Your metrics suggest academic risk. Consider increasing study hours and reducing screen time.</span>
                    </div>
                  ) : (
                    <div className="alert alert-success">
                      <CheckCircle size={16} />
                      <span>Great job! Your metrics indicate you're on a healthy academic track.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state when no result yet */}
            {!result && (
              <div className="card">
                <div className="empty-state">
                  <Activity size={48} />
                  <p>Fill in your metrics and click <strong>Check My Risk</strong> to see your assessment</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

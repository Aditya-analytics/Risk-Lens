import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import {
  Upload, Users, AlertTriangle, TrendingUp, BarChart3,
  Sparkles, FileText, History, Trash2, Download, CheckCircle, ArrowLeft
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const CHART_COLORS = ['#059669', '#DC2626', '#D97706', '#6366F1']

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const fileRef = useRef(null)
  
  const [view, setView] = useState('dashboard') // Hardcoded view

  // Dashboard state
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [csvContent, setCsvContent] = useState(null)
  const [csvHeaders, setCsvHeaders] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [columnsVerified, setColumnsVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState(null)
  const [dashboardView, setDashboardView] = useState('overview')
  const [activeTab, setActiveTab] = useState('all')
  // File read effect
  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        setCsvContent(text)
        const firstLine = text.split('\n')[0]
        const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
        setCsvHeaders(headers)
        
        const reqCols = ['hours_studied', 'avg_mid_sem_marks', 'avg_prev_sem_marks', 'attendance_percentage', 'mobile_screen_time_hours']
        const initialMapping = {}
        
        const cleanStr = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
        
        reqCols.forEach(req => {
          const cleanReq = cleanStr(req)
          let bestMatch = ''
          let bestScore = 0
          
          headers.forEach(h => {
             const cleanH = cleanStr(h)
             let score = 0
             if (cleanH === cleanReq) score = 100
             else if (cleanH.includes('mid') && req.includes('mid')) score = 90
             else if (cleanH.includes('prev') && req.includes('prev')) score = 90
             else if (cleanH.includes('attend') && req.includes('attend')) score = 90
             else if (cleanH.includes('screen') && req.includes('screen')) score = 90
             else if (cleanH.includes('study') && req.includes('study')) score = 90
             else if (cleanH.includes('hour') && req.includes('hour') && !req.includes('screen')) score = 80
             else if (cleanH.includes(cleanReq)) score = 70
             else if (cleanReq.includes(cleanH) && cleanH.length > 3) score = 70
             else {
               // Simple trigram overlap
               let overlap = 0
               for (let i = 0; i < cleanH.length - 2; i++) {
                 if (cleanReq.includes(cleanH.substring(i, i + 3))) overlap++
               }
               score = (overlap / Math.max(1, cleanH.length)) * 100
             }
             
             if (score > bestScore && score >= 40) {
               bestScore = score
               bestMatch = h
             }
          })
          initialMapping[req] = bestMatch
        })
        
        setColumnMapping(initialMapping)
        setColumnsVerified(false)
      }
      reader.readAsText(file)
    } else {
      setCsvHeaders([])
      setCsvContent(null)
      setColumnMapping({})
      setColumnsVerified(false)
    }
  }, [file])

  // File drop / select handlers
  function handleDragOver(e) { e.preventDefault(); setDragOver(true) }
  function handleDragLeave() { setDragOver(false) }
  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.name.endsWith('.csv')) setFile(droppedFile)
    else setError('Please upload a CSV file')
  }
  function handleFileSelect(e) {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  async function handleUpload() {
    if (!file || !csvContent) return
    setError('')
    setLoading(true)
    setResults(null)
    setAiInsights(null)
    setDashboardView('overview')

    try {
      // Re-write headers using mapping efficiently without splitting entire file
      const firstNewlineIndex = csvContent.indexOf('\n')
      const firstLine = firstNewlineIndex !== -1 ? csvContent.substring(0, firstNewlineIndex) : csvContent
      
      const originalHeaders = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
      const newHeaders = originalHeaders.map(h => {
        const mappedReq = Object.keys(columnMapping).find(k => columnMapping[k] === h)
        return mappedReq || h
      })
      
      const newCsv = newHeaders.join(',') + (firstNewlineIndex !== -1 ? csvContent.substring(firstNewlineIndex) : '')
      const fileToUpload = new File([newCsv], file.name, { type: 'text/csv' })

      const data = await api.predictCSV(fileToUpload, false) // Don't generate insights yet
      setResults(data)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateInsights() {
    if (!results?.dashboard_metrics) return
    setInsightsLoading(true)
    try {
      const data = await api.generateInsights(results.dashboard_metrics)
      setAiInsights(data.ai_insights)
    } catch (err) {
      setAiInsights('Failed to generate insights: ' + err.message)
    } finally {
      setInsightsLoading(false)
    }
  }

  // handleDeleteHistory removed as history is unmaintained

  function handleDownloadReport() {
    if (!results || !results.predictions || results.predictions.length === 0) return
    const preds = results.predictions
    const columns = Object.keys(preds[0])
    const csvRows = []
    
    // Header
    const exportHeaders = columns.map(col => columnMapping[col] || col)
    csvRows.push(exportHeaders.join(','))
    
    // Rows
    for (const row of preds) {
      const values = columns.map(col => {
        let val = row[col]
        if (val === null || val === undefined) val = ''
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
           val = `"${val.replace(/"/g, '""')}"`
        }
        return val
      })
      csvRows.push(values.join(','))
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Risk_Analysis_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleDownloadTopRisk() {
    if (!results || !results.dashboard_metrics || !results.dashboard_metrics.top_risk || results.dashboard_metrics.top_risk.length === 0) return
    const preds = results.dashboard_metrics.top_risk
    const columns = Object.keys(preds[0])
    const csvRows = []
    
    // Header
    const exportHeaders = columns.map(col => columnMapping[col] || col)
    csvRows.push(exportHeaders.join(','))
    
    // Rows
    for (const row of preds) {
      const values = columns.map(col => {
        let val = row[col]
        if (val === null || val === undefined) val = ''
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
           val = `"${val.replace(/"/g, '""')}"`
        }
        return val
      })
      csvRows.push(values.join(','))
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Top_Risk_Students_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleDownloadAIInsights() {
    if (!aiInsights) return
    const blob = new Blob([aiInsights], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `RiskLens_AI_Insights_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Computed data from results
  const predictions = results?.predictions || []
  const metrics = results?.dashboard_metrics || {}
  const topRisk = metrics.top_risk || []
  const topPerforming = metrics.top_performing || []
  const riskDist = metrics.risk_distribution || {}

  const totalStudents = predictions.length
  const highRiskCount = predictions.filter(p => p.prediction === 1).length
  const lowRiskCount = totalStudents - highRiskCount
  const avgRisk = totalStudents > 0
    ? Math.round(predictions.reduce((sum, p) => sum + (p.risk_probability || 0), 0) / totalStudents * 100)
    : 0

  // Pie chart data
  const pieData = [
    { name: 'Low Risk', value: lowRiskCount },
    { name: 'High Risk', value: highRiskCount },
  ].filter(d => d.value > 0)

  // Bar chart — top risk students
  const barData = topRisk.slice(0, 5).map((s, i) => ({
    name: s.student_name || s.name || `Student ${i + 1}`,
    risk: Math.round((s.risk_probability || 0) * 100),
  }))

  // Table data — top risk students details
  const topRiskStudents = [...predictions]
    .filter(p => p.prediction === 1)
    .sort((a, b) => (b.risk_probability || 0) - (a.risk_probability || 0))
    .slice(0, 5)

  // Filter predictions for table
  const filteredPredictions = activeTab === 'risk'
    ? predictions.filter(p => p.prediction === 1)
    : activeTab === 'performing'
    ? predictions.filter(p => p.prediction === 0)
    : predictions

  // Dynamic columns for full display
  const allColumns = predictions.length > 0 
    ? Object.keys(predictions[0]).filter(k => k !== 'prediction' && k !== 'risk_probability')
    : []

  // Compute behavior stats for behavior chart
  const behaviorStats = [
    { name: 'High Risk', study: 0, attendance: 0, count: 0 },
    { name: 'Low Risk', study: 0, attendance: 0, count: 0 }
  ]
  predictions.forEach(p => {
    const isRisk = p.prediction === 1
    const target = isRisk ? behaviorStats[0] : behaviorStats[1]
    target.count++
    target.study += Number(p.hours_studied || 0)
    target.attendance += Number(p.attendance_percentage || 0)
  })
  behaviorStats.forEach(b => {
    if (b.count > 0) {
      b.study = Number((b.study / b.count).toFixed(1))
      b.attendance = Number((b.attendance / b.count).toFixed(1))
    }
  })

  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Teacher Dashboard</h1>
            <p className="page-subtitle">Upload student data to generate risk assessments</p>
          </div>
        </div>

        {/* Upload Section */}
        {!results && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="card-title">Upload Student Data</span>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div
              className={`minimal-upload ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
              id="upload-zone"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {file ? (
                <div className="file-selected-state">
                  <div className="file-icon-wrapper"><FileText size={24} /></div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} title="Remove file">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-empty-state">
                  <div className="upload-icon-wrapper"><Upload size={24} /></div>
                  <p className="upload-primary-text">Click to browse or drag file here</p>
                  <p className="upload-secondary-text">CSV format only</p>
                </div>
              )}
            </div>

            {file && csvHeaders.length > 0 && !columnsVerified && (
              <div className="column-verification-card">
                <h4 style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Map Columns</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Please map your CSV columns to the required metrics:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {['hours_studied', 'avg_mid_sem_marks', 'avg_prev_sem_marks', 'attendance_percentage', 'mobile_screen_time_hours'].map(reqCol => {
                    const mappedValue = columnMapping[reqCol] || ''
                    const isMapped = mappedValue !== ''
                    return (
                      <div key={reqCol} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          {isMapped ? <CheckCircle size={16} color="var(--success)" /> : <AlertTriangle size={16} color="var(--danger)" />}
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{reqCol.replace(/_/g, ' ')}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <select 
                            className="input" 
                            style={{ width: '100%', padding: '0.375rem 0.75rem', fontSize: '0.875rem', height: 'auto' }}
                            value={mappedValue}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [reqCol]: e.target.value }))}
                          >
                            <option value="">-- Select Column --</option>
                            {csvHeaders.map(h => (
                               <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setFile(null)}>Cancel</button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setColumnsVerified(true)}
                    disabled={Object.values(columnMapping).some(v => v === '')}
                  >
                    <CheckCircle size={16} /> Confirm Mapping
                  </button>
                </div>
              </div>
            )}

            {file && columnsVerified && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleUpload}
                  disabled={loading}
                  id="upload-submit"
                >
                  {loading ? (
                    <><div className="spinner" style={{ borderTopColor: 'white' }}></div> Processing...</>
                  ) : (
                    <><BarChart3 size={18} /> Analyze Data</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Action bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <span style={{ fontWeight: 600 }}>Analysis complete — {totalStudents} students processed</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={handleDownloadReport}>
                  <Download size={16} /> Download Report
                </button>
                <button className="btn btn-secondary" onClick={() => { setResults(null); setFile(null); setAiInsights(null); setDashboardView('overview') }}>
                  <Upload size={16} /> New Upload
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-primary)' }}>
                <button 
                  className="btn btn-ghost"
                  onClick={() => setDashboardView('overview')}
                  style={{ borderRadius: '0', borderBottom: dashboardView === 'overview' ? '2px solid var(--accent)' : '2px solid transparent', color: dashboardView === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  <BarChart3 size={16} /> Dashboard Overview
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => setDashboardView('ai_insights')}
                  style={{ borderRadius: '0', borderBottom: dashboardView === 'ai_insights' ? '2px solid var(--accent)' : '2px solid transparent', color: dashboardView === 'ai_insights' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  <Sparkles size={16} /> AI Insights
                </button>
            </div>

            {/* Overview View */}
            {dashboardView === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              <StatCard
                icon={<Users size={20} />}
                label="Total Students"
                value={totalStudents}
                color="var(--accent)"
                bgColor="var(--accent-light)"
              />
              <StatCard
                icon={<AlertTriangle size={20} />}
                label="High Risk"
                value={highRiskCount}
                color="var(--danger)"
                bgColor="var(--danger-bg)"
              />
              <StatCard
                icon={<CheckCircle size={20} />}
                label="Low Risk"
                value={lowRiskCount}
                color="var(--success)"
                bgColor="var(--success-bg)"
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Avg Risk Score"
                value={`${avgRisk}%`}
                color={avgRisk >= 50 ? 'var(--danger)' : 'var(--success)'}
                bgColor={avgRisk >= 50 ? 'var(--danger-bg)' : 'var(--success-bg)'}
              />
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              {/* Pie Chart */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Risk Distribution</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Behavior Comparison Chart */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Avg. Behavior Comparison</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={behaviorStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--accent)' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#D97706' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{ fill: 'transparent' }} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                    <Bar yAxisId="left" dataKey="study" name="Study (hrs)" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar yAxisId="right" dataKey="attendance" name="Attendance (%)" fill="#D97706" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table — Top Risk Students Detailed */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <span className="card-title"><AlertTriangle size={16} style={{ color: 'var(--danger)', marginRight: '0.25rem' }} /> Top At-Risk Details</span>
                {topRiskStudents.length > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={handleDownloadTopRisk}>
                    <Download size={14} /> Download Top Risk CSV
                  </button>
                )}
              </div>
              {topRiskStudents.length > 0 ? (
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                  <table style={{ minWidth: '800px' }}>
                    <thead>
                      <tr>
                        {allColumns.map(col => (
                          <th key={col}>{(columnMapping[col] || col).replace(/_/g, ' ')}</th>
                        ))}
                        <th>Risk %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRiskStudents.map((s, i) => (
                        <tr key={i}>
                          {allColumns.map(col => (
                            <td key={col}>{s[col]}</td>
                          ))}
                          <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                            {Math.round((s.risk_probability || 0) * 100)}%
                          </td>
                          <td>
                            <span className="badge badge-danger">High Risk</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <CheckCircle size={24} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                  <p>No high-risk students found!</p>
                </div>
              )}
            </div>

            {/* Student Table */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <span className="card-title">Student Details</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['all', 'risk', 'performing'].map(tab => (
                    <button
                      key={tab}
                      className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'all' ? 'All' : tab === 'risk' ? 'High Risk' : 'Low Risk'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '800px' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      {allColumns.map(col => (
                        <th key={col}>{(columnMapping[col] || col).replace(/_/g, ' ')}</th>
                      ))}
                      <th>Risk %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredictions.slice(0, 50).map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        {allColumns.map(col => (
                          <td key={col}>{row[col]}</td>
                        ))}
                        <td style={{ fontWeight: 600, color: row.risk_probability >= 0.5 ? 'var(--danger)' : 'var(--success)' }}>
                          {Math.round((row.risk_probability || 0) * 100)}%
                        </td>
                        <td>
                          <span className={`badge ${row.prediction === 1 ? 'badge-danger' : 'badge-success'}`}>
                            {row.prediction === 1 ? 'High Risk' : 'Low Risk'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredPredictions.length > 50 && (
                <p style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  Showing 50 of {filteredPredictions.length} students
                </p>
              )}
            </div>
            </>
            )}

            {/* AI Insights View */}
            {dashboardView === 'ai_insights' && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                  <span className="card-title"><Sparkles size={14} style={{ marginRight: '0.25rem' }} /> Actionable AI Report</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {aiInsights && (
                      <button className="btn btn-secondary btn-sm" onClick={handleDownloadAIInsights}>
                        <Download size={14} /> Download Markdown
                      </button>
                    )}
                    {!aiInsights && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleGenerateInsights}
                        disabled={insightsLoading}
                        id="generate-insights"
                      >
                        {insightsLoading ? (
                          <><div className="spinner" style={{ borderTopColor: 'white', width: 14, height: 14 }}></div> Generating...</>
                        ) : (
                          <><Sparkles size={14} /> Generate Report</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {aiInsights ? (
                  <div className="insights-panel">
                    <ReactMarkdown>{aiInsights}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                    <Sparkles size={48} />
                    <p style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Unlock Deeper Analytics with Gemini AI</p>
                    <p style={{ color: 'var(--text-tertiary)' }}>Click <strong>Generate Report</strong> to analyze the risk distributions and get actionable coaching recommendations.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

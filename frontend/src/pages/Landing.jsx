import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Sun, Moon, ArrowRight, BarChart3, Brain, ShieldCheck,
  Users, Upload, Sparkles, GraduationCap, BookOpen,
  TrendingUp, Activity, Clock, ChevronRight, Zap, Target,
  LineChart, PieChart
} from 'lucide-react'

export default function Landing() {
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="navbar-brand">
            <div className="logo-icon">RL</div>
            <span>RiskLens</span>
          </div>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost" onClick={toggleTheme} id="landing-theme-toggle">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Powered Student Analytics</span>
          </div>
          <h1 className="hero-title">
            Predict Student Risk.<br />
            <span className="hero-gradient">Empower Educators.</span>
          </h1>
          <p className="hero-subtitle">
            RiskLens uses machine learning and AI insights to identify at-risk students
            early&mdash;giving teachers actionable data and students a clear view of their
            academic standing.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg hero-cta">
              Start Free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">5</span>
              <span className="hero-stat-label">Key Metrics Tracked</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">2</span>
              <span className="hero-stat-label">Role-Based Dashboards</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">AI</span>
              <span className="hero-stat-label">Gemini-Powered Insights</span>
            </div>
          </div>
        </div>

        {/* Hero Visual — Floating Dashboard Preview */}
        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <div className="hero-card-header">
              <div className="hero-card-dots">
                <span></span><span></span><span></span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Dashboard Preview</span>
            </div>
            <div className="hero-card-body">
              <div className="hero-mini-stats">
                <div className="hero-mini-stat" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <Users size={16} /> <span>124 Students</span>
                </div>
                <div className="hero-mini-stat" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  <Activity size={16} /> <span>18 At Risk</span>
                </div>
                <div className="hero-mini-stat" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                  <TrendingUp size={16} /> <span>85% Safe</span>
                </div>
              </div>
              <div className="hero-chart-placeholder">
                <div className="hero-bar" style={{ height: '60%', background: 'var(--success)' }}></div>
                <div className="hero-bar" style={{ height: '85%', background: 'var(--success)' }}></div>
                <div className="hero-bar" style={{ height: '45%', background: 'var(--warning)' }}></div>
                <div className="hero-bar" style={{ height: '90%', background: 'var(--success)' }}></div>
                <div className="hero-bar" style={{ height: '30%', background: 'var(--danger)' }}></div>
                <div className="hero-bar" style={{ height: '70%', background: 'var(--success)' }}></div>
                <div className="hero-bar" style={{ height: '25%', background: 'var(--danger)' }}></div>
                <div className="hero-bar" style={{ height: '75%', background: 'var(--success)' }}></div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="hero-float hero-float-1">
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <span>Low Risk — 85%</span>
          </div>
          <div className="hero-float hero-float-2">
            <Brain size={18} style={{ color: 'var(--accent)' }} />
            <span>AI Report Ready</span>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section className="features-section reveal" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge"><Target size={14} /> Core Capabilities</span>
            <h2>Everything you need to assess student risk</h2>
            <p>A complete platform for both educators and students, powered by machine learning.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-large">
              <div className="feature-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <BarChart3 size={24} />
              </div>
              <h3>ML-Powered Predictions</h3>
              <p>
                Our scikit-learn pipeline analyzes 5 key study metrics — hours studied, mid-sem marks,
                previous semester performance, attendance, and screen time — to predict academic risk
                with high accuracy.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Upload size={24} />
              </div>
              <h3>CSV Batch Upload</h3>
              <p>
                Teachers upload an entire class CSV and get instant risk analysis with distribution charts
                and ranked student tables.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Sparkles size={24} />
              </div>
              <h3>AI Insights (Gemini)</h3>
              <p>
                On-demand AI reports powered by Google Gemini provide actionable interventions and
                long-term strategies for at-risk students.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <GraduationCap size={24} />
              </div>
              <h3>Student Self-Check</h3>
              <p>
                Students enter their own metrics and instantly see a visual risk gauge with personalized
                tips and recommendations.
              </p>
            </div>

            <div className="feature-card feature-card-large">
              <div className="feature-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                <Clock size={24} />
              </div>
              <h3>Prediction History</h3>
              <p>
                Every prediction is automatically saved per user. Track how student risk evolves over
                time with a full history log, stored securely in Supabase with row-level security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────── */}
      <section className="how-section reveal" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge"><Zap size={14} /> Simple Workflow</span>
            <h2>How RiskLens Works</h2>
            <p>Three simple steps for teachers. One quick form for students.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Upload size={28} /></div>
              <h3>Upload or Enter Data</h3>
              <p>Teachers upload a CSV of student metrics. Students fill in a quick 5-field form.</p>
            </div>
            <div className="step-connector"><ChevronRight size={20} /></div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><LineChart size={28} /></div>
              <h3>ML Prediction</h3>
              <p>Our trained model analyzes the data and classifies each student as Low Risk or High Risk.</p>
            </div>
            <div className="step-connector"><ChevronRight size={20} /></div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><Sparkles size={28} /></div>
              <h3>Insights & Action</h3>
              <p>View charts, risk scores, and generate an AI report with specific intervention strategies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two Dashboards ─────────────────────────────────────────────── */}
      <section className="roles-section reveal">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge"><Users size={14} /> Role-Based Access</span>
            <h2>Built for both sides of the classroom</h2>
          </div>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-card-icon" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                <BookOpen size={32} color="white" />
              </div>
              <h3>Teacher Dashboard</h3>
              <ul className="role-features">
                <li><ChevronRight size={14} /> CSV batch upload with drag & drop</li>
                <li><ChevronRight size={14} /> Risk distribution pie & bar charts</li>
                <li><ChevronRight size={14} /> Top risk & top performing tables</li>
                <li><ChevronRight size={14} /> On-demand AI insight reports</li>
                <li><ChevronRight size={14} /> Full analysis history</li>
              </ul>
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Sign Up as Teacher <ArrowRight size={16} />
              </Link>
            </div>

            <div className="role-card">
              <div className="role-card-icon" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
                <GraduationCap size={32} color="white" />
              </div>
              <h3>Student Dashboard</h3>
              <ul className="role-features">
                <li><ChevronRight size={14} /> Self-assessment form (5 metrics)</li>
                <li><ChevronRight size={14} /> Visual risk gauge with percentage</li>
                <li><ChevronRight size={14} /> Personalized tips & recommendations</li>
                <li><ChevronRight size={14} /> Prediction history tracking</li>
                <li><ChevronRight size={14} /> Privacy-first — see only your data</li>
              </ul>
              <Link to="/signup" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#059669' }}>
                Sign Up as Student <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────────────────── */}
      <section className="tech-section reveal">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge"><Zap size={14} /> Tech Stack</span>
            <h2>Built with modern tools</h2>
          </div>
          <div className="tech-grid">
            {[
              { name: 'React', desc: 'Frontend UI' },
              { name: 'FastAPI', desc: 'Backend API' },
              { name: 'Scikit-Learn', desc: 'ML Pipeline' },
              { name: 'Supabase', desc: 'Auth & Database' },
              { name: 'Google Gemini', desc: 'AI Insights' },
              { name: 'Recharts', desc: 'Data Visualization' },
            ].map(tech => (
              <div className="tech-item" key={tech.name}>
                <span className="tech-name">{tech.name}</span>
                <span className="tech-desc">{tech.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="cta-section reveal">
        <div className="cta-glow"></div>
        <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <h2>Ready to identify at-risk students early?</h2>
          <p>Create your free account and start analyzing in minutes.</p>
          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link to="/signup" className="btn btn-primary btn-lg hero-cta">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="landing-footer reveal">
        <div className="landing-footer-inner" style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="navbar-brand" style={{ opacity: 0.9, marginBottom: '1rem' }}>
              <div className="logo-icon" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>RL</div>
              <span style={{ fontSize: '1rem' }}>RiskLens</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Empowering educators with AI-driven insights to identify and support at-risk students before they fall behind.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', padding: 0 }}>
                <li><a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How it Works</a></li>
                <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Sign In</Link></li>
                <li><Link to="/signup" style={{ color: 'var(--text-secondary)' }}>Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', padding: 0 }}>
                <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Terms of Service</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)' }}>Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} RiskLens. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Built with passion for education.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
  Sun, Moon, ArrowRight, BarChart3, Brain, ShieldCheck,
  Users, Upload, Sparkles, GraduationCap, BookOpen,
  TrendingUp, Activity, Clock, ChevronRight, Zap, Target,
  LineChart, PieChart, LayoutDashboard
} from 'lucide-react'

export default function Landing() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile } = useAuth()

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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="landing-nav"
      >
        <div className="landing-nav-inner">
          <div className="navbar-brand-premium">
            <div className="logo-dynamic">
              <div className="logo-monogram">RL</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-text-premium small">Risk<span>Lens</span></span>
              <span className="brand-tagline small">Early Detection, Better Outcomes</span>
            </div>
          </div>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost" onClick={toggleTheme} id="landing-theme-toggle">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user ? (
              <Link to={profile?.role === 'teacher' ? '/teacher' : '/student'} className="btn btn-primary btn-sm" style={{ gap: '0.375rem' }}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>AI-Powered Student Analytics</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hero-title"
            >
              Predict Student Risk.
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="hero-title"
              style={{ marginTop: '-0.5rem' }}
            >
              <span className="hero-gradient">Empower Educators.</span>
            </motion.h1>

            <p className="hero-subtitle">
              RiskLens uses machine learning and AI insights to identify at-risk students
              early&mdash;giving teachers actionable data and students a clear view of their
              academic standing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="hero-actions"
          >
            <Link to="/signup" className="btn btn-primary btn-lg hero-cta">
              Start Free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="hero-stats"
          >
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
          </motion.div>
        </div>

        {/* Hero Visual — Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
          className="hero-visual"
        >
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

          <div className="hero-float hero-float-1">
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <span>Low Risk — 85%</span>
          </div>
          <div className="hero-float hero-float-2">
            <Brain size={18} style={{ color: 'var(--accent)' }} />
            <span>AI Report Ready</span>
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ───────────────────────────────────────────── */}
      <section className="features-section reveal" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge"><Target size={14} /> Core Capabilities</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Everything you need to assess student risk</h2>
            <p>A complete platform for both educators and students, powered by machine learning.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <BarChart3 size={24} />
                </div>
                <div className="feature-badge">Advanced ML</div>
              </div>
              <div className="feature-content">
                <h3>ML-Powered Predictions</h3>
                <p>Our scikit-learn pipeline analyzes 5 key study metrics to predict academic risk with high accuracy.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                  <Upload size={24} />
                </div>
                <div className="feature-badge">Batch Processing</div>
              </div>
              <div className="feature-content">
                <h3>CSV Batch Upload</h3>
                <p>Teachers upload an entire class CSV and get instant risk analysis with distribution charts.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                  <Sparkles size={24} />
                </div>
                <div className="feature-badge">AI Assistant</div>
              </div>
              <div className="feature-content">
                <h3>AI Insights (Gemini)</h3>
                <p>On-demand AI reports powered by Google Gemini provide actionable interventions.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  <GraduationCap size={24} />
                </div>
                <div className="feature-badge">Personalized</div>
              </div>
              <div className="feature-content">
                <h3>Student Self-Check</h3>
                <p>Students enter metrics and instantly see a visual risk gauge with personalized tips.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                  <Clock size={24} />
                </div>
                <div className="feature-badge">Persistence</div>
              </div>
              <div className="feature-content">
                <h3>Safe & Persistent</h3>
                <p>Metadata is securely stored and session-aware. Track how student risk evolves over time.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div className="feature-badge">Secure</div>
              </div>
              <div className="feature-content">
                <h3>Role-Based Access</h3>
                <p>Multi-role support for both educators and students with isolated dashboards.</p>
              </div>
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
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Upload size={28} /></div>
              <h3>Upload Data</h3>
              <p>Teachers upload a CSV or students fill in a quick form.</p>
            </div>
            <div className="step-connector"><ChevronRight size={20} /></div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><LineChart size={28} /></div>
              <h3>ML Prediction</h3>
              <p>Our model classifies each student as Low or High Risk.</p>
            </div>
            <div className="step-connector"><ChevronRight size={20} /></div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><Sparkles size={28} /></div>
              <h3>Action</h3>
              <p>View results and generate AI intervention strategies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="landing-footer reveal">
        <div className="landing-footer-inner" style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="navbar-brand-premium" style={{ opacity: 0.9, marginBottom: '1.25rem', padding: 0 }}>
              <div className="logo-dynamic-small">
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>RL</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-text-premium small">Risk<span>Lens</span></span>
                <span className="brand-tagline small">Early Detection, Better Outcomes</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Empowering educators with AI-driven insights to identify and support students early.
            </p>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} RiskLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

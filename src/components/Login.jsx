import { useState } from 'react'
import { Lock, Mail, Shield, ArrowRight, Brain, Database, Users, User } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onLogin(role)
    }, 800)
  }

  return (
    <div className="login-layout animate-fade-in">
      <div className="login-bg-shape shape-1"></div>
      <div className="login-bg-shape shape-2"></div>

      <div className="login-container">
        <div className="login-hero">
          <div className="login-brand">
            <div className="login-logo-box">
              <Shield size={28} />
            </div>
            <h1>DocIntell AI</h1>
          </div>
          
          <h2 className="login-tagline">Unlock the true potential of your documents.</h2>
          
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon"><Brain size={18} /></div>
              <span>Transparent Reasoning Engine</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Database size={18} /></div>
              <span>Spring Batch Pipeline</span>
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-form-card">
            <div className="login-form-header">
              <h3>Welcome Back</h3>
              <p>Sign in to your intelligent workspace</p>
            </div>

            {/* Role Selector */}
            <div className="role-selector" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button
                type="button"
                className={`role-option ${role === 'user' ? 'active' : ''}`}
                onClick={() => setRole('user')}
                style={{
                  flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'user' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: role === 'user' ? 'var(--color-primary-lighter)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.2s', fontFamily: 'inherit'
                }}
              >
                <User size={20} style={{ color: role === 'user' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: role === 'user' ? 'var(--color-primary-dark)' : 'var(--color-text-primary)' }}>User</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Upload & Query</div>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
                style={{
                  flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${role === 'admin' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: role === 'admin' ? 'var(--color-success-bg)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.2s', fontFamily: 'inherit'
                }}
              >
                <Users size={20} style={{ color: role === 'admin' ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: role === 'admin' ? '#065f46' : 'var(--color-text-primary)' }}>Admin</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Full Control</div>
                </div>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input type="email" className="form-input" placeholder="admin@docintell.ai" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary login-btn" disabled={loading}
                style={{ background: role === 'admin' ? 'linear-gradient(135deg, var(--color-accent), #065f46)' : undefined,
                         boxShadow: role === 'admin' ? '0 4px 14px rgba(16,185,129,0.25)' : undefined }}>
                {loading ? 'Authenticating...' : `Sign In as ${role === 'admin' ? 'Admin' : 'User'}`}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

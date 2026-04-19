import { useState } from 'react'
import { Lock, Mail, Shield, ArrowRight, Zap, Database, Brain } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onLogin()
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

              <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

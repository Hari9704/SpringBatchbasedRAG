import { useState } from 'react'
import { Lock, Mail, Shield, ArrowRight, Brain, Database, Users, User, UserPlus, Zap, GitBranch } from 'lucide-react'

export default function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login')
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const displayName = (authMode === 'register' && fullName.trim())
        ? fullName.trim()
        : (email.split('@')[0] || 'User')
      onLogin({ role, displayName })
    }, 1000)
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    if (newRole === 'admin') setAuthMode('login')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #d1fae5 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left — Green DocIntellij Brand */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '4rem',
        background: 'linear-gradient(145deg, #064e3b 0%, #065f46 35%, #047857 65%, #059669 100%)',
        color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '420px', height: '420px', background: 'rgba(16,185,129,0.18)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'rgba(52,211,153,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #34d399)', padding: '14px', borderRadius: '18px',
              boxShadow: '0 8px 32px rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15"/>
                <path d="M6 8h8c5.523 0 10 4.477 10 10s-4.477 10-10 10H6V8z" fill="white" fillOpacity="0.9"/>
                <rect x="20" y="8" width="4" height="20" rx="2" fill="white"/>
                <circle cx="14" cy="18" r="5" fill="#064e3b"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: 'white' }}>DocIntellij</h1>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em',
                background: 'rgba(52,211,153,0.25)', color: '#6ee7b7',
                padding: '2px 10px', borderRadius: '20px', border: '1px solid rgba(110,231,183,0.3)'
              }}>RAG · v2.0-flash</span>
            </div>
          </div>

          <h2 style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-1px' }}>
            Enterprise RAG.<br /><span style={{ color: '#6ee7b7' }}>Unleashed.</span>
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.85, lineHeight: 1.7, marginBottom: '2.5rem', color: '#d1fae5' }}>
            Intelligent pre-processing, chunking, and secure retrieval powered by Spring Batch and Google Gemini 2.0.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Brain, label: 'Context-Aware RAG Intelligence' },
              { icon: Database, label: 'Spring Batch Embedding Pipeline' },
              { icon: Zap, label: 'Gemini 2.0 Flash · Low Latency' },
              { icon: GitBranch, label: 'Versioned Document Retrieval' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'rgba(255,255,255,0.07)', padding: '0.875rem 1.125rem',
                borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <Icon size={20} color="#34d399" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontFamily: 'monospace' }}>gemini-2.0-flash · text-embedding-004</span>
          </div>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem',
        background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 100%)'
      }}>
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', boxShadow: '0 20px 60px rgba(5,150,105,0.1), 0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <div style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M6 8h8c5.523 0 10 4.477 10 10s-4.477 10-10 10H6V8z" fill="white" fillOpacity="0.9"/>
                  <rect x="20" y="8" width="4" height="20" rx="2" fill="white"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#064e3b', margin: 0 }}>
                {authMode === 'login' ? 'Welcome back' : 'Join DocIntellij'}
              </h3>
            </div>
            <p style={{ color: '#6b7280', marginBottom: '2rem', marginLeft: 42 }}>
              {authMode === 'login' ? 'Sign in to your intelligence workspace.' : 'Start querying your enterprise documents today.'}
            </p>

            {/* Role Toggle */}
            <div style={{ display: 'flex', background: '#f0fdf4', borderRadius: '12px', padding: '5px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.15)' }}>
              {[
                { val: 'user', label: 'Normal User', Icon: User },
                { val: 'admin', label: 'Administrator', Icon: Shield },
              ].map(({ val, label, Icon }) => (
                <button key={val} type="button" onClick={() => handleRoleChange(val)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '8px', border: 'none',
                  background: role === val ? 'white' : 'transparent',
                  color: role === val ? '#065f46' : '#94a3b8',
                  boxShadow: role === val ? '0 2px 8px rgba(16,185,129,0.12)' : 'none',
                  fontWeight: role === val ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem',
                }}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            {/* Sign In / Register tab (user only) */}
            {role === 'user' && (
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
                {[{ id: 'login', label: 'Sign In' }, { id: 'register', label: 'Create Account' }].map(({ id, label }) => (
                  <button key={id} type="button" onClick={() => setAuthMode(id)} style={{
                    background: 'none', border: 'none', padding: '0 0 12px 0',
                    fontSize: '0.9rem', fontWeight: authMode === id ? 600 : 500,
                    color: authMode === id ? '#10b981' : '#94a3b8',
                    borderBottom: authMode === id ? '2px solid #10b981' : '2px solid transparent',
                    marginBottom: '-2px', cursor: 'pointer', transition: 'all 0.2s'
                  }}>{label}</button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserPlus size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required
                      style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #d1fae5', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#f9fafb' }}
                      onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#d1fae5'} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type="email" placeholder={role === 'admin' ? 'admin@docintellij.ai' : 'user@company.com'}
                    value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #d1fae5', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#f9fafb' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#d1fae5'} />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                  <span>Password</span>
                  {authMode === 'login' && <a href="#" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}>Forgot?</a>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #d1fae5', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none', background: '#f9fafb' }}
                    onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#d1fae5'} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop: '0.75rem', width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 8px 20px rgba(16,185,129,0.3)', transition: 'transform 0.15s, box-shadow 0.2s',
              }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {loading ? 'Authenticating...' : (authMode === 'login' ? `Sign In as ${role === 'admin' ? 'Admin' : 'User'}` : 'Create Account')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af' }}>
              DocIntellij · Enterprise RAG Platform · Gemini 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

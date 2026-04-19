import { useState } from 'react'
import { Lock, Mail, Shield, ArrowRight, Brain, Database, Users, User, UserPlus } from 'lucide-react'

export default function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call for login/register
    setTimeout(() => {
      onLogin(role)
    }, 1000)
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    if (newRole === 'admin') {
      setAuthMode('login') // Admins cannot register from the public page
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #fff7ed 0%, #f0fdf4 100%)',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Left Side - Brand & Features */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #c2410c 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dynamic Background Circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', color: 'var(--color-primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Shield size={32} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, tracking: '-1px' }}>DocIntell AI</h1>
          </div>
          
          <h2 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '2rem' }}>
            Enterprise RAG.<br/>Unleashed.
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem' }}>
            Intelligent pre-processing, chunking, and secure retrieval using Spring Batch and Google Gemini.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <Brain size={24} color="#10b981" />
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Context-Aware Intelligence</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <Database size={24} color="#10b981" />
              <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Spring Batch Optimization Pipeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.4)',
          position: 'relative'
        }}>
          
          <div style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              {authMode === 'login' ? 'Welcome Back 👋' : 'Create an Account 🚀'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              {authMode === 'login' ? 'Sign in to access your intelligence dashboard.' : 'Start querying your enterprise documents today.'}
            </p>

            {/* Role Toggle Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '6px', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                onClick={() => handleRoleChange('user')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '8px', border: 'none',
                  background: role === 'user' ? 'white' : 'transparent',
                  color: role === 'user' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                  boxShadow: role === 'user' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  fontWeight: role === 'user' ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <User size={18} /> Normal User
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('admin')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '8px', border: 'none',
                  background: role === 'admin' ? 'white' : 'transparent',
                  color: role === 'admin' ? '#065f46' : 'var(--color-text-muted)',
                  boxShadow: role === 'admin' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  fontWeight: role === 'admin' ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Users size={18} /> Administrator
              </button>
            </div>

            {/* Auth Mode Toggle (Only visible for Users) */}
            {role === 'user' && (
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
                <button 
                  type="button"
                  onClick={() => setAuthMode('login')}
                  style={{
                    background: 'none', border: 'none', padding: '0 0 12px 0',
                    fontSize: '1rem', fontWeight: authMode === 'login' ? 600 : 500,
                    color: authMode === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: authMode === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    marginBottom: '-2px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMode('register')}
                  style={{
                    background: 'none', border: 'none', padding: '0 0 12px 0',
                    fontSize: '1rem', fontWeight: authMode === 'register' ? 600 : 500,
                    color: authMode === 'register' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    borderBottom: authMode === 'register' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    marginBottom: '-2px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <UserPlus size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={fullName} onChange={e => setFullName(e.target.value)} required 
                      style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="email" 
                    placeholder={role === 'admin' ? "admin@docintell.ai" : "user@company.com"}
                    value={email} onChange={e => setEmail(e.target.value)} required 
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = role === 'admin' ? 'var(--color-accent)' : 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  <span>Password</span>
                  {authMode === 'login' && <a href="#" style={{ color: role === 'admin' ? 'var(--color-accent)' : 'var(--color-primary)', textDecoration: 'none', fontSize: '0.8rem' }}>Forgot?</a>}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} onChange={e => setPassword(e.target.value)} required 
                    style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = role === 'admin' ? 'var(--color-accent)' : 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  marginTop: '1rem', width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                  background: role === 'admin' ? 'linear-gradient(135deg, var(--color-accent), #059669)' : 'linear-gradient(135deg, var(--color-primary), #ea580c)',
                  color: 'white', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: role === 'admin' ? '0 8px 16px rgba(16,185,129,0.2)' : '0 8px 16px rgba(249,115,22,0.2)',
                  transition: 'transform 0.1s, box-shadow 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {loading ? 'Processing...' : (authMode === 'login' ? `Sign In as ${role === 'admin' ? 'Admin' : 'User'}` : 'Create Account')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

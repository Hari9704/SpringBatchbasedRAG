import { useState } from 'react'
import { Lock, Mail, Shield, ArrowRight, Brain, Database, Users, User, UserPlus } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

export default function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

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
    if (newRole === 'admin') {
      setAuthMode('login')
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setGoogleError('')
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const profile = await res.json()
        onLogin({
          role: 'user',
          displayName: profile.name || profile.email?.split('@')[0] || 'Google User',
          email: profile.email,
          picture: profile.picture,
          googleId: profile.sub,
        })
      } catch {
        setGoogleError('Failed to fetch your Google profile. Please try again.')
        setGoogleLoading(false)
      }
    },
    onError: () => {
      setGoogleError('Google sign-in was cancelled or failed. Please try again.')
      setGoogleLoading(false)
    },
  })

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID'

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
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'rgba(16,185,129,0.2)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', color: 'var(--color-primary)', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Shield size={32} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>DocIntell AI</h1>
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

            {/* Google OAuth Button — only shown for Normal User role */}
            {role === 'user' && (
              <div style={{ marginBottom: '1.5rem' }}>
                {isGoogleConfigured ? (
                  <button
                    type="button"
                    onClick={() => { setGoogleError(''); handleGoogleLogin() }}
                    disabled={googleLoading}
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', background: googleLoading ? '#f8fafc' : 'white',
                      color: '#1f2937', fontSize: '0.95rem', fontWeight: 600,
                      cursor: googleLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s, border-color 0.2s'
                    }}
                    onMouseOver={e => { if (!googleLoading) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
                  >
                    {googleLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '18px', height: '18px', border: '2px solid #e2e8f0', borderTopColor: '#4285f4', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        Signing in with Google...
                      </span>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                          <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z" fill="#FFC107"/>
                          <path d="M6.3 14.7l7 5.1C15.1 16.4 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" fill="#FF3D00"/>
                          <path d="M24 45c5.5 0 10.5-1.9 14.4-5.1l-6.7-5.5C29.7 35.8 27 36.9 24 36.9c-6 0-10.7-3.9-12.1-9.3l-7 5.4C8 41.2 15.5 45 24 45z" fill="#4CAF50"/>
                          <path d="M44.5 20H24v8.5h11.8c-.7 2.5-2.4 4.6-4.8 6l6.7 5.5C42.4 36.2 45 30.6 45 24c0-1.4-.2-2.7-.5-4z" fill="#1976D2"/>
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{
                    padding: '12px 16px', borderRadius: '10px', background: '#fef3c7',
                    border: '1px solid #fcd34d', fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5
                  }}>
                    <strong>Google OAuth not configured.</strong> Add your <code>VITE_GOOGLE_CLIENT_ID</code> secret to enable "Sign in with Google". See the setup steps below.
                  </div>
                )}

                {googleError && (
                  <p style={{ marginTop: '8px', fontSize: '0.82rem', color: '#dc2626', textAlign: 'center' }}>{googleError}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.25rem 0 0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>or continue with email</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>
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
                  marginTop: '0.5rem', width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

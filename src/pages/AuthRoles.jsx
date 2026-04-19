import { useState } from 'react'
import { Shield, Lock, UserPlus, Mail, Eye, EyeOff, Users, User, Crown } from 'lucide-react'

const users = [
  { id: 1, name: 'Admin User', email: 'admin@docintell.ai', role: 'Admin', status: 'Active', lastLogin: '2 min ago' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'User', status: 'Active', lastLogin: '14 min ago' },
  { id: 3, name: 'Mike Chen', email: 'mike@company.com', role: 'User', status: 'Active', lastLogin: '1 hr ago' },
  { id: 4, name: 'Lisa Wang', email: 'lisa@company.com', role: 'Admin', status: 'Active', lastLogin: '2 hr ago' },
  { id: 5, name: 'James Park', email: 'james@company.com', role: 'User', status: 'Inactive', lastLogin: '3 days ago' },
]

export default function AuthRoles() {
  const [view, setView] = useState('login')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="animate-fade-in" id="auth-page">
      <div className="page-header">
        <h1>Authentication & Authorization</h1>
        <p>Manage users, roles, and access control</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
        {/* Auth Forms */}
        <div style={{ width: 400 }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>
              <Lock size={14} style={{ marginRight: 6 }} /> Login
            </button>
            <button className={`tab ${view === 'signup' ? 'active' : ''}`} onClick={() => setView('signup')}>
              <UserPlus size={14} style={{ marginRight: 6 }} /> Signup
            </button>
          </div>

          <div className="card" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {view === 'login' ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-lighter)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--spacing-md)'
                  }}>
                    <Shield size={28} />
                  </div>
                  <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Welcome back</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Sign in to DocIntell AI</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input className="form-input" type="email" placeholder="admin@docintell.ai" style={{ paddingLeft: 36 }} id="login-email" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={{ paddingLeft: 36, paddingRight: 36 }} id="login-password" />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-sm)' }} id="login-btn">
                  Sign In
                </button>
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    JWT Authentication · Spring Security
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary-lighter)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto var(--spacing-md)'
                  }}>
                    <UserPlus size={28} />
                  </div>
                  <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Create Account</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Join DocIntell AI platform</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="John Doe" id="signup-name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="john@company.com" id="signup-email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min 8 characters" id="signup-password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" id="signup-role">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} id="signup-btn">
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div style={{ flex: 1 }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} /> Registered Users
              </div>
              <span className="badge badge-info">{users.length} users</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--radius-full)',
                          background: u.role === 'Admin' ? 'var(--color-warning-bg)' : 'var(--color-info-bg)',
                          color: u.role === 'Admin' ? 'var(--color-warning)' : 'var(--color-info)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {u.role === 'Admin' ? <Crown size={14} /> : <User size={14} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-warning' : 'badge-info'}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        <span className="badge-dot"></span>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{u.lastLogin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FolderOpen, GitCompare,
  MessageSquare, Brain, ThumbsUp, BarChart3,
  Settings, Shield, TestTube, LogOut
} from 'lucide-react'

const navItems = [
  {
    section: 'MAIN',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/upload', label: 'Upload & Processing', icon: Upload },
      { to: '/admin/documents', label: 'Document Explorer', icon: FolderOpen },
      { to: '/admin/versioning', label: 'Versioning', icon: GitCompare },
    ]
  },
  {
    section: 'AI',
    items: [
      { to: '/admin/query', label: 'AI Query', icon: MessageSquare },
      { to: '/admin/reasoning', label: 'Reasoning Breakdown', icon: Brain },
      { to: '/admin/feedback', label: 'Feedback & Learning', icon: ThumbsUp },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/panel', label: 'Admin Panel', icon: Settings },
      { to: '/admin/auth', label: 'Auth & Roles', icon: Shield },
      { to: '/admin/tests', label: 'Selenium Tests', icon: TestTube },
    ]
  }
]

export default function AdminSidebar({ onLogout }) {
  const location = useLocation()

  return (
    <aside className="sidebar" id="admin-sidebar">
      <div className="sidebar-brand">
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
            <circle cx="10" cy="16" r="2"/>
            <path d="M14 14l2 2"/>
          </svg>
          DocIntell AI
        </h1>
        <p>Admin Control Panel</p>
      </div>

      <nav>
        {navItems.map(section => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon
              const isActive = item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  id={`nav-admin-${item.to.split('/').pop() || 'dashboard'}`}
                >
                  <Icon className="sidebar-icon" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-outline logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

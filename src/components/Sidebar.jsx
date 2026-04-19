import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FolderOpen, GitCompare,
  MessageSquare, Brain, ThumbsUp, BarChart3,
  Settings, Shield, TestTube
} from 'lucide-react'

const navItems = [
  {
    section: 'MAIN',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/upload', label: 'Upload & Processing', icon: Upload },
      { to: '/documents', label: 'Document Explorer', icon: FolderOpen },
      { to: '/versioning', label: 'Versioning', icon: GitCompare },
    ]
  },
  {
    section: 'AI',
    items: [
      { to: '/query', label: 'AI Query', icon: MessageSquare },
      { to: '/reasoning', label: 'Reasoning Breakdown', icon: Brain },
      { to: '/feedback', label: 'Feedback & Learning', icon: ThumbsUp },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/admin', label: 'Admin Panel', icon: Settings },
      { to: '/auth', label: 'Auth & Roles', icon: Shield },
      { to: '/tests', label: 'Selenium Tests', icon: TestTube },
    ]
  }
]
import { LogOut } from 'lucide-react'

export default function Sidebar({ onLogout }) {
  const location = useLocation()

  return (
    <aside className="sidebar" id="sidebar">
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
        <p>Document Intelligence Platform</p>
      </div>

      <nav>
        {navItems.map(section => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  id={`nav-${item.to.replace('/', '') || 'dashboard'}`}
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

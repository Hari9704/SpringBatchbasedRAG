import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FolderOpen,
  MessageSquare, Brain, ThumbsUp, BarChart3,
  Settings, LogOut
} from 'lucide-react'

const navItems = [
  {
    section: 'MAIN',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/app/upload', label: 'Upload & Process', icon: Upload },
      { to: '/app/documents', label: 'My Documents', icon: FolderOpen },
    ]
  },
  {
    section: 'AI',
    items: [
      { to: '/app/chat', label: 'AI Chat', icon: MessageSquare },
      { to: '/app/reasoning', label: 'Reasoning View', icon: Brain },
      { to: '/app/feedback', label: 'Feedback', icon: ThumbsUp },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      { to: '/app/analytics', label: 'My Analytics', icon: BarChart3 },
      { to: '/app/settings', label: 'Settings', icon: Settings },
    ]
  }
]

export default function UserSidebar({ onLogout, isOpen = false, onNavigate = () => {} }) {
  const location = useLocation()

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="user-sidebar">
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
        <p>User Workspace</p>
      </div>

      <nav>
        {navItems.map(section => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon
              const isActive = item.to === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  id={`nav-user-${item.to.split('/').pop() || 'dashboard'}`}
                  onClick={onNavigate}
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
        <button className="btn btn-outline logout-btn" onClick={onLogout} type="button">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

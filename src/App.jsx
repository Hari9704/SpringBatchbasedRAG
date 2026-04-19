import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Login from './components/Login'
import UserSidebar from './components/UserSidebar'
import AdminSidebar from './components/AdminSidebar'
import { UserWorkspaceProvider } from './context/UserWorkspaceContext'

import Dashboard from './pages/Dashboard'
import UploadProcessing from './pages/UploadProcessing'
import DocumentExplorer from './pages/DocumentExplorer'
import Versioning from './pages/Versioning'
import AIQuery from './pages/AIQuery'
import ReasoningBreakdown from './pages/ReasoningBreakdown'
import FeedbackLearning from './pages/FeedbackLearning'
import Analytics from './pages/Analytics'
import AdminPanel from './pages/AdminPanel'
import AuthRoles from './pages/AuthRoles'
import SeleniumTests from './pages/SeleniumTests'

import UserDashboard from './pages/user/UserDashboard'
import UserUpload from './pages/user/UserUpload'
import MyDocuments from './pages/user/MyDocuments'
import AIChat from './pages/user/AIChat'
import UserAnalytics from './pages/user/UserAnalytics'
import UserSettings from './pages/user/UserSettings'

function UserAppShell({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <UserWorkspaceProvider>
      <UserSidebar
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      <button
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close navigation"
        type="button"
      />
      <main className="main-content">
        <div className="mobile-topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle navigation"
            type="button"
          >
            <Menu size={18} />
          </button>
          <div className="app-shell-title">DocIntell AI</div>
        </div>
        <Routes>
          <Route path="/app" element={<UserDashboard />} />
          <Route path="/app/upload" element={<UserUpload />} />
          <Route path="/app/documents" element={<MyDocuments />} />
          <Route path="/app/chat" element={<AIChat />} />
          <Route path="/app/reasoning" element={<ReasoningBreakdown />} />
          <Route path="/app/feedback" element={<FeedbackLearning />} />
          <Route path="/app/analytics" element={<UserAnalytics />} />
          <Route path="/app/settings" element={<UserSettings />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
    </UserWorkspaceProvider>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  const handleLogin = (role) => {
    setIsAuthenticated(true)
    setUserRole(role)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        {userRole === 'admin' ? (
          <>
            <AdminSidebar onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/upload" element={<UploadProcessing />} />
                <Route path="/admin/documents" element={<DocumentExplorer />} />
                <Route path="/admin/versioning" element={<Versioning />} />
                <Route path="/admin/query" element={<AIQuery />} />
                <Route path="/admin/reasoning" element={<ReasoningBreakdown />} />
                <Route path="/admin/feedback" element={<FeedbackLearning />} />
                <Route path="/admin/analytics" element={<Analytics />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/auth" element={<AuthRoles />} />
                <Route path="/admin/tests" element={<SeleniumTests />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <UserAppShell onLogout={handleLogout} />
        )}
      </div>
    </BrowserRouter>
  )
}

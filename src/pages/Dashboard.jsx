import { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import Sidebar from '../components/layout/Sidebar'
import './Dashboard.css'

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="header-title">Dashboard</h2>
            <p className="header-subtitle">Welcome back, here are your tasks for today.</p>
          </div>
          <div className="header-right">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>

        {/* Content area coming next */}
      </main>
    </div>
  )
}

export default Dashboard

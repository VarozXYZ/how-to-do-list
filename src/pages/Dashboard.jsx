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

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Section Header */}
          <div className="section-header">
            <h3 className="section-title">Tareas Activas</h3>
            <div className="section-actions">
              <button className="action-btn">
                <span>☰</span> Filter
              </button>
              <button className="action-btn">
                <span>↕</span> Sort
              </button>
            </div>
          </div>

          {/* Card Grid */}
          <div className="cards-grid">
            {/* Cards coming next */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

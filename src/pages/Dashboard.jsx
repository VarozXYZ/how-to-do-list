import { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import Sidebar from '../components/layout/Sidebar'
import CardItem from '../components/cards/CardItem'
import './Dashboard.css'

// Example cards - remove later
const exampleCards = [
  {
    id: 1,
    title: 'Plan Q3 Strategy',
    description: 'Draft initial outline based on Q3 goals, focusing on social media growth.',
    category: 'Marketing',
    completed: false,
    aiEnhanced: true
  },
  {
    id: 2,
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and organic vegetables for the week.',
    category: 'Personal',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 3,
    title: 'Update Website Hero',
    description: 'Replace current image with the new 3D render and update CTA buttons.',
    category: 'Design',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 4,
    title: 'Team Sync',
    description: 'Weekly sync with the development team to discuss sprint progress.',
    category: 'Work',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 5,
    title: 'Competitor Analysis',
    description: "Review top 3 competitors' pricing models and feature sets.",
    category: 'Research',
    completed: false,
    aiEnhanced: false
  }
]

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [cards, setCards] = useState(exampleCards)

  const handleToggleComplete = (id) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, completed: !card.completed } : card
    ))
  }

  const handleAiAssist = (id) => {
    console.log('AI Assist clicked for card:', id)
  }

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
            {cards.map(card => (
              <CardItem
                key={card.id}
                card={card}
                onToggleComplete={handleToggleComplete}
                onAiAssist={handleAiAssist}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

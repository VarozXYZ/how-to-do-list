import { useState } from 'react'
import { Form, InputGroup } from 'react-bootstrap'
import Sidebar from '../components/layout/Sidebar'
import CardItem from '../components/cards/CardItem'
import CardDetail from '../components/cards/CardDetail'
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
  const [showModal, setShowModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const categories = ['all', 'Marketing', 'Personal', 'Design', 'Work', 'Research']
  const sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' }
  ]

  const handleToggleComplete = (id) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, completed: !card.completed } : card
    ))
  }

  const handleAiAssist = (id) => {
    console.log('AI Assist clicked for card:', id)
  }

  const handleSaveCard = (newCard) => {
    setCards([newCard, ...cards])
  }

  const handleDeleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id))
  }

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.category.toLowerCase().includes(query)
      )
      const matchesCategory = filterCategory === 'all' || card.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.id - b.id
        case 'newest':
          return b.id - a.id
        case 'a-z':
          return a.title.localeCompare(b.title)
        case 'z-a':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

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
              {/* Filter Button */}
              <div className="action-wrapper">
                <button 
                  className={`action-btn ${filterCategory !== 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu)
                    setShowSortMenu(false)
                  }}
                >
                  <span>☰</span> Filter {filterCategory !== 'all' && `(${filterCategory})`}
                </button>
                {showFilterMenu && (
                  <div className="action-dropdown">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        className={`dropdown-option ${filterCategory === cat ? 'selected' : ''}`}
                        onClick={() => {
                          setFilterCategory(cat)
                          setShowFilterMenu(false)
                        }}
                      >
                        {cat === 'all' ? 'Todas las categorías' : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Button */}
              <div className="action-wrapper">
                <button 
                  className="action-btn"
                  onClick={() => {
                    setShowSortMenu(!showSortMenu)
                    setShowFilterMenu(false)
                  }}
                >
                  <span>↕</span> Sort
                </button>
                {showSortMenu && (
                  <div className="action-dropdown">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`dropdown-option ${sortBy === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setSortBy(opt.value)
                          setShowSortMenu(false)
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Grid */}
          <div className="cards-grid">
            {filteredCards.length > 0 ? (
              filteredCards.map(card => (
                <CardItem
                  key={card.id}
                  card={card}
                  onToggleComplete={handleToggleComplete}
                  onAiAssist={handleAiAssist}
                  onDelete={handleDeleteCard}
                />
              ))
            ) : (
              <div className="no-results">
                <span>🔍</span>
                <p>No se encontraron tareas</p>
              </div>
            )}
          </div>
        </div>

        {/* FAB Button */}
        <button className="fab-button" title="Nueva tarea" onClick={() => setShowModal(true)}>
          <span>+</span>
        </button>

        {/* Create Task Modal */}
        <CardDetail 
          show={showModal} 
          onHide={() => setShowModal(false)}
          onSave={handleSaveCard}
        />
      </main>
    </div>
  )
}

export default Dashboard

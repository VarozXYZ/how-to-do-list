import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CardItem from '../components/cards/CardItem'
import ThemeToggle from '../components/common/ThemeToggle'
import { useCards } from '../context/CardsContext'
import { useDebounce } from '../hooks/useDebounce'
import './Dashboard.css'

const Completed = () => {
  const { completedCards, toggleComplete, deleteCard, getTagById, loading } = useCards()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredCards = completedCards.filter(card => {
    const query = debouncedSearchQuery.toLowerCase()
    const tag = getTagById(card.tagId)
    return (
      card.title.toLowerCase().includes(query) ||
      card.description.toLowerCase().includes(query) ||
      (tag?.name || '').toLowerCase().includes(query)
    )
  })

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="header-title">Completadas</h2>
            <p className="header-subtitle">Tareas que has terminado. ¡Buen trabajo!</p>
          </div>
          <div className="header-right">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar completadas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <ThemeToggle />
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-dot"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          <div className="section-header">
            <h3 className="section-title">
              Tareas completadas ({completedCards.length})
            </h3>
          </div>

          {/* Card Grid */}
          <div className="cards-grid">
            {loading ? (
              <div className="no-results">
                <span>⏳</span>
                <p>Cargando tareas...</p>
              </div>
            ) : filteredCards.length > 0 ? (
              filteredCards.map(card => (
                <CardItem
                  key={card.id}
                  card={card}
                  onToggleComplete={toggleComplete}
                  onDelete={deleteCard}
                />
              ))
            ) : (
              <div className="no-results">
                <span>✨</span>
                <p>{completedCards.length === 0 
                  ? 'No hay tareas completadas aún' 
                  : 'No se encontraron tareas'}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Completed


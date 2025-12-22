import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CardItem from '../components/cards/CardItem'
import CardDetail from '../components/cards/CardDetail'
import { useCards } from '../context/CardsContext'
import './Dashboard.css'

const Dashboard = () => {
  const { activeCards, tags, addCard, updateCard, deleteCard, toggleComplete, getTagById } = useCards()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [filterTagId, setFilterTagId] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  const filterRef = useRef(null)
  const sortRef = useRef(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false)
      }
    }

    if (showFilterMenu || showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterMenu, showSortMenu])

  const sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'a-z', label: 'A-Z' },
    { value: 'z-a', label: 'Z-A' }
  ]

  const handleAiAssist = (id) => {
    console.log('AI Assist clicked for card:', id)
  }

  const handleEdit = (card) => {
    setEditingCard(card)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCard(null)
  }

  // Filter and sort cards
  const filteredCards = activeCards
    .filter(card => {
      const query = searchQuery.toLowerCase()
      const tag = getTagById(card.tagId)
      const matchesSearch = (
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        (tag?.name || '').toLowerCase().includes(query)
      )
      const matchesTag = filterTagId === 'all' || card.tagId === filterTagId
      return matchesSearch && matchesTag
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

  const selectedFilterTag = filterTagId !== 'all' ? getTagById(filterTagId) : null

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="header-title">Mis Tareas</h2>
            <p className="header-subtitle">Bienvenido, aquí están tus tareas de hoy.</p>
          </div>
          <div className="header-right">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar tareas..."
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
            <h3 className="section-title">Tareas Activas ({filteredCards.length})</h3>
            <div className="section-actions">
              {/* Filter Button */}
              <div className="action-wrapper" ref={filterRef}>
                <button 
                  className={`action-btn ${filterTagId !== 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu)
                    setShowSortMenu(false)
                  }}
                  style={selectedFilterTag ? {
                    backgroundColor: selectedFilterTag.color,
                    borderColor: selectedFilterTag.borderColor,
                    color: selectedFilterTag.textColor
                  } : {}}
                >
                  <span>☰</span> {selectedFilterTag ? selectedFilterTag.name : 'Filtrar'}
                </button>
                {showFilterMenu && (
                  <div className="action-dropdown">
                    <button
                      className={`dropdown-option ${filterTagId === 'all' ? 'selected' : ''}`}
                      onClick={() => {
                        setFilterTagId('all')
                        setShowFilterMenu(false)
                      }}
                    >
                      Todas las etiquetas
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        className={`dropdown-option ${filterTagId === tag.id ? 'selected' : ''}`}
                        style={{
                          backgroundColor: tag.color,
                          color: tag.textColor
                        }}
                        onClick={() => {
                          setFilterTagId(tag.id)
                          setShowFilterMenu(false)
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Button */}
              <div className="action-wrapper" ref={sortRef}>
                <button 
                  className="action-btn"
                  onClick={() => {
                    setShowSortMenu(!showSortMenu)
                    setShowFilterMenu(false)
                  }}
                >
                  <span>↕</span> Ordenar
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
                  onToggleComplete={toggleComplete}
                  onAiAssist={handleAiAssist}
                  onDelete={deleteCard}
                  onEdit={handleEdit}
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
          +
        </button>

        {/* Create/Edit Task Modal */}
        <CardDetail 
          show={showModal} 
          onHide={handleCloseModal}
          onSave={addCard}
          onUpdate={updateCard}
          editCard={editingCard}
        />
      </main>
    </div>
  )
}

export default Dashboard

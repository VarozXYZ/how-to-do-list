import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/layout/Sidebar'
import CardItem from '../components/cards/CardItem'
import CardDetail from '../components/cards/CardDetail'
import ThemeToggle from '../components/common/ThemeToggle'
import { useCards } from '../context/CardsContext'
import { useTheme } from '../context/ThemeContext'
import './Dashboard.css'

const Dashboard = () => {
  const { activeCards, tags, addCard, updateCard, deleteCard, toggleComplete, getTagById, loading } = useCards()
  const { darkMode } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [filterTagId, setFilterTagId] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  const filterRef = useRef(null)
  const priorityRef = useRef(null)
  const sortRef = useRef(null)
  
  const priorityOptions = [
    { value: 'all', label: 'Todas', color: null, bgColor: null },
    { value: 'alta', label: 'Alta', color: '#dc2626', bgColor: '#fef2f2' },
    { value: 'media', label: 'Media', color: '#d97706', bgColor: '#fffbeb' },
    { value: 'baja', label: 'Baja', color: '#16a34a', bgColor: '#f0fdf4' },
    { value: 'expirado', label: 'Expirado', color: '#dc2626', bgColor: '#fef2f2' }
  ]

  // Helper function to check if a card is expired
  const isCardExpired = (card) => {
    if (!card.dueDate && !card.dueTime) return false
    if (card.completed) return false
    
    const now = new Date()
    let cardDateTime = null
    
    if (card.dueDate && card.dueTime) {
      const dateStr = card.dueDate.split('T')[0]
      cardDateTime = new Date(`${dateStr}T${card.dueTime}`)
    } else if (card.dueDate) {
      cardDateTime = new Date(card.dueDate)
      cardDateTime.setHours(23, 59, 59, 999)
    } else if (card.dueTime) {
      const today = new Date()
      const [hours, minutes] = card.dueTime.split(':')
      cardDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    }
    
    return cardDateTime && cardDateTime < now
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityMenu(false)
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false)
      }
    }

    if (showFilterMenu || showPriorityMenu || showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterMenu, showPriorityMenu, showSortMenu])

  const sortOptions = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'priority', label: 'Por prioridad' },
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

  // Priority order for sorting (expired first, then alta, media, baja)
  // Lower number = higher priority in sort
  // Expired status adds a penalty that makes expired cards appear first
  const getPriorityOrder = (card) => {
    const priorityOrder = { alta: 0, media: 1, baja: 2 }
    const basePriority = priorityOrder[card.priority] ?? 3 // Unknown priority goes last
    
    // If expired, subtract 10 to ensure they appear before non-expired cards
    // This way expired alta (0-10=-10) < expired media (1-10=-9) < expired baja (2-10=-8)
    // And all expired cards appear before non-expired (alta=0, media=1, baja=2)
    if (isCardExpired(card)) {
      return basePriority - 10
    }
    
    return basePriority
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
      const matchesPriority = filterPriority === 'all' 
        ? true 
        : filterPriority === 'expirado' 
          ? isCardExpired(card)
          : card.priority === filterPriority
      return matchesSearch && matchesTag && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.id - b.id
        case 'newest':
          return b.id - a.id
        case 'priority':
          return getPriorityOrder(a) - getPriorityOrder(b)
        case 'a-z':
          return a.title.localeCompare(b.title)
        case 'z-a':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

  // Get unique tags and priorities from current cards
  const availableTagIds = [...new Set(activeCards.map(card => card.tagId).filter(Boolean))]
  const availableTags = tags.filter(tag => availableTagIds.includes(tag.id))
  
  const availablePriorities = [...new Set(activeCards.map(card => card.priority).filter(Boolean))]
  const hasExpiredCards = activeCards.some(card => isCardExpired(card))
  const availablePriorityOptions = priorityOptions.filter(opt => {
    if (opt.value === 'all') return true // Always show "Todas"
    if (opt.value === 'expirado') return hasExpiredCards // Only show if there are expired cards
    return availablePriorities.includes(opt.value) // Only show if priority exists in cards
  })

  const selectedFilterTag = filterTagId !== 'all' ? getTagById(filterTagId) : null
  const selectedPriority = priorityOptions.find(p => p.value === filterPriority)

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="header-title">Mis tareas</h2>
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
            <ThemeToggle />
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
            <h3 className="section-title">Tareas activas ({filteredCards.length})</h3>
            <div className="section-actions">
              {/* Filter Button */}
              <div className="action-wrapper" ref={filterRef}>
                <button 
                  className={`action-btn ${filterTagId !== 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu)
                    setShowPriorityMenu(false)
                    setShowSortMenu(false)
                  }}
                  style={selectedFilterTag ? (darkMode ? {
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: selectedFilterTag.borderColor + '40',
                    color: selectedFilterTag.textColor
                  } : {
                    backgroundColor: selectedFilterTag.color,
                    borderColor: selectedFilterTag.borderColor,
                    color: selectedFilterTag.textColor
                  }) : {}}
                >
                  <span>🏷️</span> {selectedFilterTag ? selectedFilterTag.name : 'Etiqueta'}
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
                    {availableTags.map(tag => {
                      const tagStyle = darkMode ? {
                        backgroundColor: 'var(--bg-tertiary)',
                        color: tag.textColor
                      } : {
                        backgroundColor: tag.color,
                        color: tag.textColor
                      }
                      return (
                        <button
                          key={tag.id}
                          className={`dropdown-option ${filterTagId === tag.id ? 'selected' : ''}`}
                          style={tagStyle}
                          onClick={() => {
                            setFilterTagId(tag.id)
                            setShowFilterMenu(false)
                          }}
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Priority Filter Button */}
              <div className="action-wrapper" ref={priorityRef}>
                <button 
                  className={`action-btn ${filterPriority !== 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setShowPriorityMenu(!showPriorityMenu)
                    setShowFilterMenu(false)
                    setShowSortMenu(false)
                  }}
                  style={selectedPriority?.color ? (darkMode ? {
                    backgroundColor: selectedPriority.value === 'expirado' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
                    borderColor: selectedPriority.color + '40',
                    color: selectedPriority.color
                  } : {
                    backgroundColor: selectedPriority.bgColor,
                    borderColor: selectedPriority.color,
                    color: selectedPriority.color
                  }) : {}}
                >
                  <span>⚡</span> {selectedPriority?.value !== 'all' ? (selectedPriority.value === 'expirado' ? '🕐 ' : '') + selectedPriority.label : 'Prioridad'}
                </button>
                {showPriorityMenu && (
                  <div className="action-dropdown">
                    {availablePriorityOptions.map(opt => {
                      const priorityStyle = opt.color ? (darkMode ? {
                        backgroundColor: opt.value === 'alta' ? 'rgba(239, 68, 68, 0.15)' :
                                         opt.value === 'media' ? 'rgba(249, 115, 22, 0.15)' :
                                         opt.value === 'baja' ? 'rgba(34, 197, 94, 0.15)' :
                                         'rgba(239, 68, 68, 0.15)', // expirado
                        color: opt.color
                      } : {
                        backgroundColor: opt.bgColor,
                        color: opt.color
                      }) : {}
                      return (
                        <button
                          key={opt.value}
                          className={`dropdown-option ${filterPriority === opt.value ? 'selected' : ''}`}
                          style={priorityStyle}
                          onClick={() => {
                            setFilterPriority(opt.value)
                            setShowPriorityMenu(false)
                          }}
                        >
                          {opt.value === 'expirado' ? '🕐 ' : ''}{opt.label}
                        </button>
                      )
                    })}
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
                    setShowPriorityMenu(false)
                  }}
                >
                  <span>↕️</span> Ordenar
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

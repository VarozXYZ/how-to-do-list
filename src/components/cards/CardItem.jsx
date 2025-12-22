import { useState, useEffect, useRef } from 'react'
import { useCards } from '../../context/CardsContext'
import './CardItem.css'

const CardItem = ({ card, onToggleComplete, onAiAssist, onDelete, onEdit }) => {
  const { id, title, description, tagId, completed } = card
  const { getTagById } = useCards()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const tag = getTagById(tagId)

  const getCardStyle = () => {
    if (!tag) return {}
    return {
      background: `linear-gradient(135deg, ${tag.color} 0%, #ffffff 100%)`,
      borderColor: tag.borderColor
    }
  }

  const getButtonStyle = () => {
    if (!tag) return {}
    return {
      background: `linear-gradient(135deg, ${tag.textColor} 0%, ${tag.textColor} 100%, ${tag.borderColor} 100%)`,
      color: '#ffffff',
      border: 'none'
    }
  }

  return (
    <div 
      className="card-item"
      style={getCardStyle()}
    >
      {/* Header */}
      <div className="card-header">
        <span 
          className="card-category"
          style={{
            backgroundColor: tag?.color,
            color: tag?.textColor,
            borderColor: tag?.borderColor
          }}
        >
          {tag?.name || 'Sin etiqueta'}
        </span>
        <div className="card-menu-wrapper" ref={menuRef}>
          <button 
            className="card-more-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span>⋯</span>
          </button>
          {showMenu && (
            <div className="card-dropdown">
              <button 
                className="dropdown-item"
                onClick={() => {
                  onEdit && onEdit(card)
                  setShowMenu(false)
                }}
              >
                <span>✏️</span> Editar
              </button>
              <button 
                className="dropdown-item delete"
                onClick={() => {
                  onDelete && onDelete(id)
                  setShowMenu(false)
                }}
              >
                <span>🗑️</span> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <h4 className="card-title">{title}</h4>
      <p className="card-description">{description}</p>

      {/* Footer */}
      <div className="card-footer">
        <button 
          className="ai-assist-btn"
          style={getButtonStyle()}
          onClick={() => onAiAssist && onAiAssist(id)}
        >
          <span>✨</span>
          <span>Mejorar con IA</span>
        </button>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggleComplete && onToggleComplete(id)}
          />
          <span className="checkmark"></span>
        </label>
      </div>
    </div>
  )
}

export default CardItem

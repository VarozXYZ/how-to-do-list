import { useState } from 'react'
import { useCards } from '../../context/CardsContext'
import { useTheme } from '../../context/ThemeContext'
import './CardItem.css'

const CardItem = ({ card, onToggleComplete, onAiAssist, onDelete, onEdit, onView }) => {
  const { id, title, description, tagId, completed, dueDate, dueTime, priority } = card
  const { getTagById } = useCards()
  const { darkMode } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const tag = getTagById(tagId)
  
  const priorityConfig = {
    alta: { label: 'Alta', color: '#dc2626', bgColor: '#fef2f2' },
    media: { label: 'Media', color: '#d97706', bgColor: '#fffbeb' },
    baja: { label: 'Baja', color: '#16a34a', bgColor: '#f0fdf4' }
  }
  
  const currentPriority = priorityConfig[priority] || priorityConfig.media

  // Check if card is expired
  const isExpired = () => {
    if (!dueDate && !dueTime) return false
    if (completed) return false // Completed cards are not expired
    
    const now = new Date()
    let cardDateTime = null
    
    if (dueDate && dueTime) {
      // Combine date and time
      const dateStr = dueDate.split('T')[0] // Get YYYY-MM-DD
      cardDateTime = new Date(`${dateStr}T${dueTime}`)
    } else if (dueDate) {
      // Only date, use end of day
      cardDateTime = new Date(dueDate)
      cardDateTime.setHours(23, 59, 59, 999)
    } else if (dueTime) {
      // Only time, use today
      const today = new Date()
      const [hours, minutes] = dueTime.split(':')
      cardDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    }
    
    return cardDateTime && cardDateTime < now
  }

  const expired = isExpired()

  const getCardStyle = () => {
    if (!tag) return {}
    if (darkMode) {
      // Dark mode: solid background with glassy effect
      return {
        background: `rgba(26, 26, 26, 0.8)`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderColor: tag.borderColor + '40'
      }
    }
    // Light mode: gradient
    return {
      background: `linear-gradient(135deg, ${tag.color} 0%, #ffffff 100%)`,
      borderColor: tag.borderColor
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      onDelete && onDelete(id)
    }, 400) // Match animation duration
  }

  const handleToggleComplete = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      onToggleComplete && onToggleComplete(id)
      setIsAnimating(false)
    }, 400) // Match animation duration
  }

  const handleCardClick = () => {
    if (!isAnimating && onView) {
      onView(card)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    if (!isAnimating && onEdit) {
      onEdit(card)
    }
  }

  return (
    <div 
      className={`card-item ${isAnimating ? 'blur-out' : ''}`}
      style={{ ...getCardStyle(), cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-badges">
        <span 
          className="card-category"
          style={{
            backgroundColor: tag?.textColor,
            color: '#ffffff',
            border: 'none'
          }}
        >
          {tag?.name || 'Sin etiqueta'}
        </span>
          <span 
            className="card-priority"
            style={{
              backgroundColor: darkMode ? `${currentPriority.color}20` : currentPriority.bgColor,
              color: currentPriority.color,
              borderColor: currentPriority.color
            }}
          >
            {currentPriority.label}
          </span>
          {expired && (
            <span 
              className="card-priority"
              style={{
                backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                color: '#dc2626',
                borderColor: '#dc2626'
              }}
              title="Expirado"
            >
              🕐 Expirado
            </span>
          )}
        </div>
        <div className="card-hover-actions">
          <button 
            className="card-edit-btn"
            onClick={handleEditClick}
            title="Editar tarea"
            style={{
              background: `${tag?.textColor}${darkMode ? '30' : '15'}`,
              borderColor: `${tag?.textColor}${darkMode ? '50' : '30'}`,
              color: tag?.textColor
            }}
          >
            ✏️
          </button>
        <button 
          className="card-delete-btn"
            onClick={handleDelete}
          title="Eliminar tarea"
          style={{
            background: `${tag?.textColor}${darkMode ? '30' : '15'}`,
            borderColor: `${tag?.textColor}${darkMode ? '50' : '30'}`,
            color: tag?.textColor
          }}
        >
          🗑️
        </button>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h4 className="card-title">{title}</h4>
        <p className="card-description">{description}</p>
        
        {/* Date display */}
        {(dueDate || dueTime) && (
          <div className="card-date">
            <span>📅</span>
            <span>
              {dueDate && new Date(dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              {dueDate && dueTime && ' • '}
              {dueTime}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <button 
          className="ai-assist-btn"
          onClick={(e) => {
            e.stopPropagation()
            onAiAssist && onAiAssist(id)
          }}
          title="Mejorar con IA"
        >
          <span>✨</span>
          <span>IA</span>
        </button>
        <label className="checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
          />
          <span className="checkmark"></span>
        </label>
      </div>
    </div>
  )
}

export default CardItem

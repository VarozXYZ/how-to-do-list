import { Modal } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import { useCards } from '../../context/CardsContext'
import { useTheme } from '../../context/ThemeContext'
import './CardView.css'

const CardView = ({ show, onHide, card, onEdit, onDelete }) => {
  const { getTagById } = useCards()
  const { darkMode } = useTheme()

  if (!card) return null

  const tag = getTagById(card.tagId)
  
  const priorityConfig = {
    alta: { label: 'Alta', color: '#dc2626', bgColor: '#fef2f2' },
    media: { label: 'Media', color: '#d97706', bgColor: '#fffbeb' },
    baja: { label: 'Baja', color: '#16a34a', bgColor: '#f0fdf4' }
  }
  
  const currentPriority = priorityConfig[card.priority] || priorityConfig.media

  // Check if card is expired
  const isExpired = () => {
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

  const expired = isExpired()

  const handleEdit = () => {
    onHide()
    setTimeout(() => {
      onEdit && onEdit(card)
    }, 100)
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      onDelete && onDelete(card.id)
      onHide()
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="card-view-modal"
    >
      <div className="card-view-container">
        {/* Header */}
        <div className="card-view-header">
          <div className="card-view-badges">
            {tag && (
              <span 
                className="card-view-tag"
                style={{
                  backgroundColor: tag.textColor,
                  color: '#ffffff'
                }}
              >
                {tag.name}
              </span>
            )}
            <span 
              className="card-view-priority"
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
                className="card-view-priority"
                style={{
                  backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
                  color: '#dc2626',
                  borderColor: '#dc2626'
                }}
              >
                🕐 Expirado
              </span>
            )}
          </div>
          <button className="modal-close-btn" onClick={onHide}>
            <span>✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="card-view-body">
          <h2 className="card-view-title">{card.title}</h2>
          
          {card.description && (
            <div className="card-view-description">
              <ReactMarkdown>{card.description}</ReactMarkdown>
            </div>
          )}

          {(card.dueDate || card.dueTime) && (
            <div className="card-view-date">
              <span className="card-view-date-icon">📅</span>
              <span>
                {card.dueDate && new Date(card.dueDate).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
                {card.dueDate && card.dueTime && ' • '}
                {card.dueTime}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="card-view-footer">
          <button className="card-view-btn card-view-btn-edit" onClick={handleEdit}>
            <span>✏️</span> Editar
          </button>
          <button className="card-view-btn card-view-btn-delete" onClick={handleDelete}>
            <span>🗑️</span> Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default CardView


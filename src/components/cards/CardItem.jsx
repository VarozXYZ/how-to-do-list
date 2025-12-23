import { useCards } from '../../context/CardsContext'
import './CardItem.css'

const CardItem = ({ card, onToggleComplete, onAiAssist, onDelete, onEdit }) => {
  const { id, title, description, tagId, completed, dueDate, dueTime } = card
  const { getTagById } = useCards()

  const tag = getTagById(tagId)

  const getCardStyle = () => {
    if (!tag) return {}
    return {
      background: `linear-gradient(135deg, ${tag.color} 0%, #ffffff 100%)`,
      borderColor: tag.borderColor
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
            backgroundColor: tag?.textColor,
            color: '#ffffff',
            border: 'none'
          }}
        >
          {tag?.name || 'Sin etiqueta'}
        </span>
        <button 
          className="card-delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete && onDelete(id)
          }}
          title="Eliminar tarea"
          style={{
            background: `${tag?.textColor}15`,
            borderColor: `${tag?.textColor}30`,
            color: tag?.textColor
          }}
        >
          🗑️
        </button>
      </div>

      {/* Content */}
      <div 
        className="card-content"
        onClick={() => onEdit && onEdit(card)}
        style={{ cursor: 'pointer' }}
      >
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
            onChange={() => onToggleComplete && onToggleComplete(id)}
          />
          <span className="checkmark"></span>
        </label>
      </div>
    </div>
  )
}

export default CardItem

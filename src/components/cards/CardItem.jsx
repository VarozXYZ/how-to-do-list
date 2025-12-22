import { useState } from 'react'
import './CardItem.css'

const CardItem = ({ card, onToggleComplete, onAiAssist, onDelete }) => {
  const { id, title, description, category, completed, aiEnhanced } = card
  const [showMenu, setShowMenu] = useState(false)

  const getCategoryClass = (cat) => {
    const categories = {
      'Marketing': 'category-blue',
      'Personal': 'category-purple',
      'Design': 'category-orange',
      'Work': 'category-green',
      'Research': 'category-pink'
    }
    return categories[cat] || 'category-blue'
  }

  return (
    <div className={`card-item ${aiEnhanced ? 'ai-enhanced' : ''}`}>
      {/* Header */}
      <div className="card-header">
        <span className={`card-category ${getCategoryClass(category)}`}>
          {category}
        </span>
        <div className="card-menu-wrapper">
          <button 
            className="card-more-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <span>⋯</span>
          </button>
          {showMenu && (
            <div className="card-dropdown">
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
          className={`ai-assist-btn ${aiEnhanced ? 'enhanced' : ''}`}
          onClick={() => onAiAssist && onAiAssist(id)}
        >
          <span>✨</span>
          <span>{aiEnhanced ? 'AI Enhance' : 'AI Assist'}</span>
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

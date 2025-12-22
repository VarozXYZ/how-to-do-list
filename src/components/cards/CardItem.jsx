import './CardItem.css'

const CardItem = ({ card, onToggleComplete, onAiAssist }) => {
  const { id, title, description, category, completed, aiEnhanced } = card

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
        <button className="card-more-btn">
          <span>⋯</span>
        </button>
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

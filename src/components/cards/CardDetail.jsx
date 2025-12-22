import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './CardDetail.css'

const CardDetail = ({ show, onHide, onSave }) => {
  const [title, setTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState('default')
  const [tags, setTags] = useState([])
  const [showTagPicker, setShowTagPicker] = useState(false)

  const availableTags = [
    { name: 'Marketing', color: 'blue' },
    { name: 'Personal', color: 'purple' },
    { name: 'Design', color: 'orange' },
    { name: 'Work', color: 'green' },
    { name: 'Research', color: 'pink' }
  ]

  const colors = [
    { id: 'default', color: '#f1f5f9', border: '#e2e8f0' },
    { id: 'red', color: '#fef2f2', border: '#fecaca' },
    { id: 'amber', color: '#fffbeb', border: '#fde68a' },
    { id: 'green', color: '#f0fdf4', border: '#bbf7d0' },
    { id: 'blue', color: '#eff6ff', border: '#bfdbfe' },
    { id: 'purple', color: '#faf5ff', border: '#e9d5ff' }
  ]

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag.name !== tagToRemove.name))
  }

  const addTag = (tag) => {
    if (!tags.find(t => t.name === tag.name)) {
      setTags([...tags, tag])
    }
    setShowTagPicker(false)
  }

  const handleClose = () => {
    setTitle('')
    setAiPrompt('')
    setDescription('')
    setSelectedColor('default')
    setTags([])
    setShowTagPicker(false)
    onHide()
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, añade un título')
      return
    }

    const selectedColorObj = colors.find(c => c.id === selectedColor) || colors[0]
    
    const newCard = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: tags.length > 0 ? tags[0].name : 'Personal',
      completed: false,
      aiEnhanced: false,
      color: selectedColorObj.color,
      borderColor: selectedColorObj.border,
      aiPrompt: aiPrompt.trim()
    }

    onSave(newCard)
    handleClose()
  }

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      className="task-modal"
    >
      {/* Header */}
      <div className="modal-header-custom">
        <div className="modal-header-left">
          <div className="modal-icon">
            <span>📝</span>
          </div>
          <div className="modal-header-text">
            <h2 className="modal-title-custom">Nueva Tarea</h2>
            <p className="modal-subtitle">Define los detalles de tu actividad</p>
          </div>
        </div>
        <button className="modal-close-btn" onClick={handleClose}>
          <span>✕</span>
        </button>
      </div>

      {/* Body */}
      <div className="modal-body-custom">
        {/* Title Input */}
        <div className="form-group">
          <label className="form-label-modal">Título de la tarea</label>
          <input
            type="text"
            className="form-input-modal"
            placeholder="Ej: Revisar reporte trimestral"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* AI Assistant Section */}
        <div className="ai-assistant-box">
          <span className="ai-assistant-label">
            <span>✨</span> Asistente IA
          </span>
          <div className="ai-assistant-content">
            <div className="ai-input-row">
              <div className="ai-input-wrapper">
                <span className="ai-input-icon">🪄</span>
                <input
                  type="text"
                  className="ai-input"
                  placeholder="Ej: 'Generar checklist para lanzamiento de producto'..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>
              <button className="ai-generate-btn">
                <span>⚡</span> Generar
              </button>
            </div>
            <p className="ai-helper-text">
              La IA completará la descripción y sugerirá etiquetas automáticamente.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label-modal">Descripción y notas</label>
          <textarea
            className="form-textarea-modal"
            placeholder="Añade detalles, enlaces o subtareas aquí..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        {/* Divider */}
        <div className="modal-divider"></div>

        {/* Metadata Grid */}
        <div className="metadata-grid">
          {/* Date & Time */}
          <div className="metadata-section">
            <label className="form-label-modal">Fecha y Hora</label>
            <div className="datetime-row">
              <button className="datetime-btn">
                <span>📅</span>
                <span>Hoy</span>
                <span className="dropdown-icon">▾</span>
              </button>
              <button className="datetime-btn time-btn">
                <span>🕐</span>
                <span>14:00</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="metadata-section">
            <label className="form-label-modal">Etiquetas</label>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span key={index} className={`tag tag-${tag.color}`}>
                  {tag.name}
                  <button className="tag-remove" onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
              <div className="tag-picker-wrapper">
                <button 
                  className="add-tag-btn"
                  onClick={() => setShowTagPicker(!showTagPicker)}
                >
                  <span>+</span> Etiqueta
                </button>
                {showTagPicker && (
                  <div className="tag-picker-dropdown">
                    {availableTags
                      .filter(tag => !tags.find(t => t.name === tag.name))
                      .map((tag) => (
                        <button
                          key={tag.name}
                          className={`tag-option tag-${tag.color}`}
                          onClick={() => addTag(tag)}
                        >
                          {tag.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="metadata-section full-width">
            <label className="form-label-modal">Color de la tarjeta</label>
            <div className="color-picker">
              {colors.map((c) => (
                <button
                  key={c.id}
                  className={`color-btn ${selectedColor === c.id ? 'selected' : ''}`}
                  style={{ backgroundColor: c.color }}
                  onClick={() => setSelectedColor(c.id)}
                >
                  {selectedColor === c.id && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer coming next */}
      </div>

      {/* Footer */}
      <div className="modal-footer-custom">
        <button className="btn-cancel" onClick={handleClose}>
          Cancelar
        </button>
        <button className="btn-save" onClick={handleSave}>
          <span>💾</span> Guardar Tarea
        </button>
      </div>
    </Modal>
  )
}

export default CardDetail

import { useState, useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import DatePicker, { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import { useCards } from '../../context/CardsContext'
import { useTheme } from '../../context/ThemeContext'
import { generateContent } from '../../services/ai'
import './CardDetail.css'

registerLocale('es', es)

const CardDetail = ({ show, onHide, onSave, onUpdate, editCard }) => {
  const { tags, addTag, deleteTag, toggleFavoriteTag, getFavoriteTag } = useCards()
  const { darkMode } = useTheme()
  
  const [title, setTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [priority, setPriority] = useState('baja')
  const [dueDate, setDueDate] = useState(null)
  const [dueTime, setDueTime] = useState(null)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#eff6ff')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  
  const priorityOptions = [
    { value: 'alta', label: 'Alta', color: '#dc2626', bgColor: '#fef2f2' },
    { value: 'media', label: 'Media', color: '#d97706', bgColor: '#fffbeb' },
    { value: 'baja', label: 'Baja', color: '#16a34a', bgColor: '#f0fdf4' }
  ]
  
  const tagPickerRef = useRef(null)
  const isEditing = !!editCard

  // Set defaults when modal opens
  useEffect(() => {
    if (show) {
      setAiError(null) // Clear any previous AI errors
    }
    if (show && !editCard) {
      // New card: use favorite tag or first available tag
      const favoriteTag = getFavoriteTag()
      setSelectedTagId(favoriteTag?.id || tags[0]?.id || '')
      setDueDate(null)
      setDueTime(null)
    } else if (editCard) {
      // Editing: populate with existing data
      setTitle(editCard.title || '')
      setDescription(editCard.description || '')
      setSelectedTagId(editCard.tagId || getFavoriteTag()?.id || tags[0]?.id || '')
      setPriority(editCard.priority || 'baja')
      setAiPrompt(editCard.aiPrompt || '')
      setDueDate(editCard.dueDate ? new Date(editCard.dueDate) : null)
      setDueTime(editCard.dueTime ? new Date(`2000-01-01T${editCard.dueTime}`) : null)
    }
  }, [show, editCard, tags, getFavoriteTag])

  // Close tag picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(event.target)) {
        setShowTagPicker(false)
        setShowNewTagForm(false)
      }
    }

    if (showTagPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTagPicker])

  const colorPresets = [
    { color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8' }, // Blue
    { color: '#faf5ff', borderColor: '#e9d5ff', textColor: '#7c3aed' }, // Purple
    { color: '#fff7ed', borderColor: '#fed7aa', textColor: '#c2410c' }, // Orange
    { color: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#15803d' }, // Green
    { color: '#fdf2f8', borderColor: '#fbcfe8', textColor: '#be185d' }, // Pink
    { color: '#fef2f2', borderColor: '#fecaca', textColor: '#dc2626' }, // Red
    { color: '#fffbeb', borderColor: '#fde68a', textColor: '#d97706' }, // Amber
    { color: '#f0fdfa', borderColor: '#99f6e4', textColor: '#0d9488' }, // Teal
  ]

  const handleClose = () => {
    setTitle('')
    setAiPrompt('')
    setDescription('')
    const favoriteTag = getFavoriteTag()
    setSelectedTagId(favoriteTag?.id || tags[0]?.id || '')
    setPriority('baja')
    setDueDate(null)
    setDueTime(null)
    setShowTagPicker(false)
    setShowNewTagForm(false)
    setNewTagName('')
    setNewTagColor('#eff6ff')
    setAiError(null)
    onHide()
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor, añade un título')
      return
    }

    setSaving(true)

    try {
      if (isEditing) {
        const updatedData = {
          title: title.trim(),
          description: description ? description.trim() : '',
          tagId: selectedTagId,
          priority,
          aiPrompt: aiPrompt ? aiPrompt.trim() : '',
          dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
          dueTime: dueTime ? dueTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null
        }
        await onUpdate(editCard.id, updatedData)
      } else {
        const newCard = {
          title: title.trim(),
          description: description.trim(),
          tagId: selectedTagId,
          priority,
          aiPrompt: aiPrompt.trim(),
          dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
          dueTime: dueTime ? dueTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null
        }
        await onSave(newCard)
      }
      handleClose()
    } catch (error) {
      console.error('Error saving card:', error)
      alert('Error al guardar la tarea')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    
    const colorPreset = colorPresets.find(c => c.color === newTagColor) || colorPresets[0]
    const newTag = {
      name: newTagName.trim(),
      color: colorPreset.color,
      borderColor: colorPreset.borderColor,
      textColor: colorPreset.textColor
    }
    
    try {
      const newTagId = await addTag(newTag)
      // Update selected tag immediately after creation
      setSelectedTagId(newTagId)
      setNewTagName('')
      setNewTagColor('#eff6ff')
      setShowNewTagForm(false)
      // Keep tag picker open briefly to show the new tag is selected, then close
      setTimeout(() => {
        setShowTagPicker(false)
      }, 100)
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Error al crear la etiqueta')
    }
  }

  const handleAiGenerate = async () => {
    if (!title.trim()) {
      setAiError('Añade un título primero para generar contenido con IA')
      return
    }

    setAiLoading(true)
    setAiError(null)

    try {
      const result = await generateContent(
        title.trim(),
        description.trim(),
        aiPrompt.trim(),
        editCard?.id || null
      )
      
      // Set the generated content as the description
      setDescription(result.content)
      setAiError(null)
    } catch (error) {
      console.error('AI Generation error:', error)
      const errorMessage = error.response?.data?.reason || 
                          error.response?.data?.error || 
                          'Error al generar contenido. Inténtalo de nuevo.'
      setAiError(errorMessage)
    } finally {
      setAiLoading(false)
    }
  }

  const selectedTag = tags.find(t => t.id === selectedTagId) || tags[0]

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
            <span>{isEditing ? '✏️' : '📝'}</span>
          </div>
          <div className="modal-header-text">
            <h2 className="modal-title-custom">{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <p className="modal-subtitle">{isEditing ? 'Modifica los detalles de tu tarea' : 'Define los detalles de tu actividad'}</p>
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
                  disabled={aiLoading}
                />
              </div>
              <button 
                className={`ai-generate-btn ${aiLoading ? 'loading' : ''}`}
                onClick={handleAiGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <span className="ai-spinner"></span> Generando...
                  </>
                ) : (
                  <>
                    <span>⚡</span> Generar
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="ai-error-text">{aiError}</p>
            )}
            <p className="ai-helper-text">
              La IA generará una descripción útil basada en el título y tus instrucciones.
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
            <label className="form-label-modal">Fecha y hora</label>
            <div className="datetime-row">
              <div className="datetime-input-wrapper">
                <span className="datetime-icon">📅</span>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  onFocus={() => {
                    if (!dueDate) {
                      setDueDate(new Date())
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  placeholderText="Fecha"
                  className="datetime-input"
                  calendarClassName="custom-calendar"
                  popperPlacement="bottom-start"
                  isClearable
                />
              </div>
              <div className="datetime-input-wrapper time-wrapper">
                <span className="datetime-icon">🕐</span>
                <DatePicker
                  selected={dueTime}
                  onChange={(time) => setDueTime(time)}
                  onFocus={() => {
                    if (!dueTime) {
                      setDueTime(new Date())
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Hora"
                  dateFormat="HH:mm"
                  locale="es"
                  placeholderText="Hora"
                  className="datetime-input"
                  calendarClassName="custom-calendar"
                  popperPlacement="bottom-start"
                  isClearable
                />
              </div>
            </div>
          </div>

          {/* Tag Selection */}
          <div className="metadata-section">
            <label className="form-label-modal">Etiqueta</label>
            <div className="tag-selector-wrapper" ref={tagPickerRef}>
              <button 
                className="tag-selector-btn"
                style={darkMode ? {
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: selectedTag?.borderColor + '40',
                  color: selectedTag?.textColor
                } : {
                  backgroundColor: selectedTag?.color,
                  borderColor: selectedTag?.borderColor,
                  color: selectedTag?.textColor
                }}
                onClick={() => setShowTagPicker(!showTagPicker)}
              >
                {selectedTag?.name || 'Seleccionar'}
                <span className="dropdown-icon">▾</span>
              </button>
              
              {showTagPicker && (
                <div className="tag-picker-dropdown">
                  {tags.map((tag) => {
                    // Dark mode: use dark background with colored text
                    // Light mode: use tag's original colors
                    const tagStyle = darkMode ? {
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'transparent',
                      color: tag.textColor
                    } : {
                      backgroundColor: tag.color,
                      borderColor: tag.borderColor,
                      color: tag.textColor
                    }
                    
                    return (
                      <div key={tag.id} className="tag-option-wrapper">
                        <button
                          className="tag-option"
                          style={tagStyle}
                          onClick={() => {
                            setSelectedTagId(tag.id)
                            setShowTagPicker(false)
                          }}
                        >
                          {tag.name}
                        </button>
                        <button
                          className="tag-favorite-btn"
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              await toggleFavoriteTag(tag.id)
                            } catch (error) {
                              console.error('Error toggling favorite:', error)
                            }
                          }}
                          title={tag.isFavorite ? "Quitar de favoritos" : "Marcar como favorita"}
                        >
                          {tag.isFavorite ? '⭐' : '☆'}
                        </button>
                        <button
                          className="tag-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (selectedTagId === tag.id) {
                              // Find first available tag that's not the one being deleted
                              const fallbackTag = tags.find(t => t.id !== tag.id) || tags[0]
                              setSelectedTagId(fallbackTag?.id || '')
                            }
                            deleteTag(tag.id)
                          }}
                          title="Eliminar etiqueta"
                        >
                          ×
                        </button>
                    </div>
                    )
                  })}
                  
                  <div className="tag-picker-divider"></div>
                  
                  {!showNewTagForm ? (
                    <button 
                      className="create-tag-btn"
                      onClick={() => setShowNewTagForm(true)}
                    >
                      <span>+</span> Crear etiqueta
                    </button>
                  ) : (
                    <div className="new-tag-form">
                      <input
                        type="text"
                        className="new-tag-input"
                        placeholder="Nombre de la etiqueta"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        autoFocus
                      />
                      <div className="new-tag-colors">
                        {colorPresets.map((preset, idx) => {
                          // In dark mode, show textColor (font color) for both background and border
                          // In light mode, show color for background and borderColor for border
                          const displayColor = darkMode ? preset.textColor : preset.color
                          const displayBorderColor = darkMode ? preset.textColor : preset.borderColor
                          return (
                            <button
                              key={idx}
                              className={`color-preset-btn ${newTagColor === preset.color ? 'selected' : ''}`}
                              style={{ 
                                backgroundColor: displayColor, 
                                borderColor: displayBorderColor 
                              }}
                              onClick={() => setNewTagColor(preset.color)}
                            />
                          )
                        })}
                      </div>
                      <div className="new-tag-actions">
                        <button 
                          className="new-tag-cancel"
                          onClick={() => {
                            setShowNewTagForm(false)
                            setNewTagName('')
                          }}
                        >
                          Cancelar
                        </button>
                        <button 
                          className="new-tag-save"
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim()}
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="metadata-section">
            <label className="form-label-modal">Prioridad</label>
            <div className="priority-selector">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value
                return (
                  <button
                    key={opt.value}
                    className={`priority-btn ${isSelected ? 'selected' : ''}`}
                    style={darkMode ? {
                      backgroundColor: isSelected ? `rgba(${opt.value === 'alta' ? '239, 68, 68' : opt.value === 'media' ? '249, 115, 22' : '34, 197, 94'}, 0.15)` : 'var(--bg-tertiary)',
                      borderColor: isSelected ? opt.color : 'var(--border-color)',
                      color: isSelected ? opt.color : 'var(--text-secondary)'
                    } : {
                      backgroundColor: isSelected ? opt.bgColor : 'transparent',
                      borderColor: isSelected ? opt.color : 'var(--border-color)',
                      color: isSelected ? opt.color : 'var(--text-secondary)'
                    }}
                    onClick={() => setPriority(opt.value)}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer-custom">
        <button className="btn-cancel" onClick={handleClose}>
          Cancelar
        </button>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          <span>💾</span> {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar tarea')}
        </button>
      </div>
    </Modal>
  )
}

export default CardDetail

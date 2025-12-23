import { useState, useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import DatePicker, { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import { useCards } from '../../context/CardsContext'
import './CardDetail.css'

registerLocale('es', es)

const CardDetail = ({ show, onHide, onSave, onUpdate, editCard }) => {
  const { tags, addTag, deleteTag, isDefaultTag } = useCards()
  
  const [title, setTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || '')
  const [dueDate, setDueDate] = useState(null)
  const [dueTime, setDueTime] = useState(null)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#eff6ff')
  const [saving, setSaving] = useState(false)
  
  const tagPickerRef = useRef(null)
  const isEditing = !!editCard

  // Set defaults when modal opens
  useEffect(() => {
    if (show && !editCard) {
      // New card: set default date/time to now + 2 hours
      const now = new Date()
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      setDueDate(now)
      setDueTime(twoHoursLater)
    } else if (editCard) {
      // Editing: populate with existing data
      setTitle(editCard.title || '')
      setDescription(editCard.description || '')
      setSelectedTagId(editCard.tagId || tags[0]?.id || '')
      setAiPrompt(editCard.aiPrompt || '')
      setDueDate(editCard.dueDate ? new Date(editCard.dueDate) : null)
      setDueTime(editCard.dueTime ? new Date(`2000-01-01T${editCard.dueTime}`) : null)
    }
  }, [show, editCard, tags])

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
    setSelectedTagId(tags[0]?.id || '')
    setDueDate(null)
    setDueTime(null)
    setShowTagPicker(false)
    setShowNewTagForm(false)
    setNewTagName('')
    setNewTagColor('#eff6ff')
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
          description: description.trim(),
          tagId: selectedTagId,
          aiPrompt: aiPrompt.trim(),
          dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
          dueTime: dueTime ? dueTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null
        }
        await onUpdate(editCard.id, updatedData)
      } else {
        const newCard = {
          title: title.trim(),
          description: description.trim(),
          tagId: selectedTagId,
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
      setSelectedTagId(newTagId)
      setNewTagName('')
      setNewTagColor('#eff6ff')
      setShowNewTagForm(false)
      setShowTagPicker(false)
    } catch (error) {
      console.error('Error creating tag:', error)
      alert('Error al crear la etiqueta')
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
            <label className="form-label-modal">Fecha y hora</label>
            <div className="datetime-row">
              <div className="datetime-input-wrapper">
                <span className="datetime-icon">📅</span>
                <DatePicker
                  selected={dueDate}
                  onChange={(date) => setDueDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale="es"
                  placeholderText="Fecha"
                  className="datetime-input"
                  calendarClassName="custom-calendar"
                  popperPlacement="bottom-start"
                  isClearable
                />
              </div>
              <div className="datetime-input-wrapper">
                <span className="datetime-icon">🕐</span>
                <DatePicker
                  selected={dueTime}
                  onChange={(time) => setDueTime(time)}
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
                style={{ 
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
                  {tags.map((tag) => (
                    <div key={tag.id} className="tag-option-wrapper">
                      <button
                        className="tag-option"
                        style={{ 
                          backgroundColor: tag.color,
                          borderColor: tag.borderColor,
                          color: tag.textColor
                        }}
                        onClick={() => {
                          setSelectedTagId(tag.id)
                          setShowTagPicker(false)
                        }}
                      >
                        {tag.name}
                      </button>
                      {!isDefaultTag(tag.id) && (
                        <button
                          className="tag-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (selectedTagId === tag.id) {
                              setSelectedTagId(tags[0]?.id || '')
                            }
                            deleteTag(tag.id)
                          }}
                          title="Eliminar etiqueta"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
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
                        {colorPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            className={`color-preset-btn ${newTagColor === preset.color ? 'selected' : ''}`}
                            style={{ backgroundColor: preset.color, borderColor: preset.borderColor }}
                            onClick={() => setNewTagColor(preset.color)}
                          />
                        ))}
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

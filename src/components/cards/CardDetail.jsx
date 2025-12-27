import { useState, useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import DatePicker, { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import ReactMarkdown from 'react-markdown'
import { useCards } from '../../context/CardsContext'
import { useTheme } from '../../context/ThemeContext'
import { generateBasicContent, generateAdvancedContent, generateContextQuestions } from '../../services/ai'
import ConfirmModal from '../common/ConfirmModal'
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
  const [isLimitError, setIsLimitError] = useState(false)
  const [aiMode, setAiMode] = useState('basic') // 'basic' or 'advanced'
  const [showQuestionsModal, setShowQuestionsModal] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [aiAnswers, setAiAnswers] = useState({})
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [initialValues, setInitialValues] = useState(null)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progress, setProgress] = useState(0)
  
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
      setIsLimitError(false)
      setShowConfirmClose(false)
    }
    if (show && !editCard) {
      // New card: use favorite tag or first available tag
      const favoriteTag = getFavoriteTag()
      const defaultTagId = favoriteTag?.id || tags[0]?.id || ''
      setSelectedTagId(defaultTagId)
      setDueDate(null)
      setDueTime(null)
      setAiMode('basic')
      setAiPrompt('')
      setTitle('')
      setDescription('')
      setPriority('baja')
      
      // Store initial values for new card
      setInitialValues({
        title: '',
        description: '',
        tagId: defaultTagId,
        priority: 'baja',
        dueDate: null,
        dueTime: null
      })
    } else if (editCard) {
      // Editing: populate with existing data
      const cardTitle = editCard.title || ''
      const cardDescription = editCard.description || ''
      const cardTagId = editCard.tagId || getFavoriteTag()?.id || tags[0]?.id || ''
      const cardPriority = editCard.priority || 'baja'
      const cardDueDate = editCard.dueDate ? new Date(editCard.dueDate) : null
      const cardDueTime = editCard.dueTime ? new Date(`2000-01-01T${editCard.dueTime}`) : null
      
      setTitle(cardTitle)
      setDescription(cardDescription)
      setSelectedTagId(cardTagId)
      setPriority(cardPriority)
      setDueDate(cardDueDate)
      setDueTime(cardDueTime)
      
      // Check if opened from AI button (has aiMode and aiPrompt properties)
      if (editCard.aiMode === 'advanced') {
        setAiMode('advanced')
        setAiPrompt(editCard.aiPrompt || '')
      } else {
        setAiMode('basic')
      setAiPrompt(editCard.aiPrompt || '')
      }
      
      // Store initial values for editing
      setInitialValues({
        title: cardTitle,
        description: cardDescription,
        tagId: cardTagId,
        priority: cardPriority,
        dueDate: editCard.dueDate,
        dueTime: editCard.dueTime
      })
    }
  }, [show, editCard, tags, getFavoriteTag])


  // Ensure selectedTagId is valid when tags change
  // Only update if the selected tag doesn't exist (don't override valid selections)
  useEffect(() => {
    if (selectedTagId && tags.length > 0) {
      const tagExists = tags.find(t => t.id === selectedTagId)
      if (!tagExists) {
        // If selected tag doesn't exist anymore, select first available
        if (tags[0]) {
          setSelectedTagId(tags[0].id)
    }
      }
    } else if (!selectedTagId && tags.length > 0) {
      // If no tag is selected, select the first one
      setSelectedTagId(tags[0].id)
    }
  }, [tags])

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

  // Helper function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialValues) return false
    
    const currentDueTime = dueTime ? dueTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null
    const initialDueTime = initialValues.dueTime ? (typeof initialValues.dueTime === 'string' ? initialValues.dueTime : new Date(`2000-01-01T${initialValues.dueTime}`).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })) : null
    const currentDueDate = dueDate ? dueDate.toISOString().split('T')[0] : null
    const initialDueDate = initialValues.dueDate ? (typeof initialValues.dueDate === 'string' ? initialValues.dueDate : new Date(initialValues.dueDate).toISOString().split('T')[0]) : null
    
    return (
      title.trim() !== (initialValues.title || '').trim() ||
      description.trim() !== (initialValues.description || '').trim() ||
      selectedTagId !== initialValues.tagId ||
      priority !== initialValues.priority ||
      currentDueDate !== initialDueDate ||
      currentDueTime !== initialDueTime
    )
  }

  const handleClose = (force = false) => {
    // Check for unsaved changes
    if (!force && hasUnsavedChanges()) {
      setShowConfirmClose(true)
      return
    }
    
    setTitle('')
    setAiPrompt('')
    setDescription('')
    const favoriteTag = getFavoriteTag()
    setSelectedTagId(favoriteTag?.id || tags[0]?.id || '')
    setPriority('baja')
    setDueDate(null)
    setDueTime(null)
    setShowTagPicker(false)
    setAiMode('basic')
    setAiError(null)
    setIsLimitError(false)
    setAiQuestions([])
    setAiAnswers({})
    setShowQuestionsModal(false)
    setShowNewTagForm(false)
    setNewTagName('')
    setNewTagColor('#eff6ff')
    setAiError(null)
    setIsLimitError(false)
    setShowMarkdownPreview(false)
    setInitialValues(null)
    setShowConfirmClose(false)
    setShowProgressModal(false)
    setProgress(0)
    onHide()
  }

  const handleConfirmClose = () => {
    handleClose(true)
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
      // Reset initial values after successful save
      setInitialValues(null)
      handleClose(true)
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
      // Wait for React to update the tags state, then set selected tag
      // Use a small delay to ensure tags array has been updated
      setTimeout(() => {
      setSelectedTagId(newTagId)
      setNewTagName('')
      setNewTagColor('#eff6ff')
      setShowNewTagForm(false)
        // Close tag picker after a brief delay to show selection
        setTimeout(() => {
      setShowTagPicker(false)
        }, 25)
      }, 10)
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
      if (aiMode === 'basic') {
        // Basic mode: only title + description
        const result = await generateBasicContent(
          title.trim(),
          description.trim(),
          editCard?.id || null
        )
        setDescription(result.content)
        setAiError(null)
        setAiLoading(false)
      } else {
        // Advanced mode: generate questions first
        const questionsResult = await generateContextQuestions(
          title.trim(),
          description.trim(),
          aiPrompt.trim()
        )
        
        if (questionsResult.questions && questionsResult.questions.length > 0) {
          // Show questions modal
          setAiQuestions(questionsResult.questions)
          setShowQuestionsModal(true)
          setAiLoading(false)
        } else {
          // No questions, proceed with generation
          // Show progress modal for advanced mode
          setShowProgressModal(true)
          setProgress(0)
          
          // Start progress simulation
          let progressInterval = startProgressSimulation(setProgress)
          
          try {
            const result = await generateAdvancedContent(
              title.trim(),
              description.trim(),
              aiPrompt.trim(),
              {},
              editCard?.id || null
            )
            // Complete progress to 100%
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            setProgress(100)
            
            // Wait a bit for smooth completion animation
            await new Promise(resolve => setTimeout(resolve, 500))
            
            setDescription(result.content)
            setAiError(null)
            setShowProgressModal(false)
            setProgress(0)
            setAiLoading(false)
          } catch (error) {
            if (progressInterval) {
              clearInterval(progressInterval)
            }
            setShowProgressModal(false)
            setProgress(0)
            throw error
          }
        }
      }
    } catch (error) {
      console.error('AI Generation error:', error)
      
      // Check if it's a limit error (403)
      if (error.response?.status === 403) {
        const limitData = error.response?.data
        const errorMessage = limitData?.reason || limitData?.error || 'Has alcanzado el límite de generaciones de tu plan.'
        setAiError(errorMessage)
        setIsLimitError(true)
      } else {
        const errorMessage = error.response?.data?.reason || 
                            error.response?.data?.error || 
                            'Error al generar contenido. Inténtalo de nuevo.'
        setAiError(errorMessage)
        setIsLimitError(false)
      }
      
      setShowProgressModal(false)
      setProgress(0)
      setAiLoading(false)
    }
  }

  const handleSubmitAnswers = async () => {
    setAiLoading(true)
    setAiError(null)
    
    // Close questions modal and show progress modal
    setShowQuestionsModal(false)
    setShowProgressModal(true)
    setProgress(0)
    
    // Start progress simulation
    let progressInterval = startProgressSimulation(setProgress)

    try {
      const result = await generateAdvancedContent(
        title.trim(),
        description.trim(),
        aiPrompt.trim(),
        aiAnswers,
        editCard?.id || null
      )
      
      // Complete progress to 100%
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setProgress(100)
      
      // Wait a bit for smooth completion animation
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDescription(result.content)
      setAiError(null)
      setAiAnswers({})
      setAiQuestions([])
      setShowProgressModal(false)
      setProgress(0)
      setAiLoading(false)
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setShowProgressModal(false)
      setProgress(0)
      console.error('AI Generation error:', error)
      
      // Check if it's a limit error (403)
      if (error.response?.status === 403) {
        const limitData = error.response?.data
        const errorMessage = limitData?.reason || limitData?.error || 'Has alcanzado el límite de generaciones de tu plan.'
        setAiError(errorMessage)
        setIsLimitError(true)
      } else {
        const errorMessage = error.response?.data?.reason || 
                            error.response?.data?.error || 
                            'Error al generar contenido. Inténtalo de nuevo.'
        setAiError(errorMessage)
        setIsLimitError(false)
      }
      
      setAiLoading(false)
    }
  }
  
  // Progress simulation function
  // Median time for advanced generation: ~30 seconds
  // We'll simulate progress up to 85%, then wait for actual completion
  const startProgressSimulation = (setProgressFn) => {
    const medianTime = 30000 // 30 seconds
    const targetProgress = 85 // Stop at 85% and wait for actual completion
    const updateInterval = 50 // Update every 50ms
    const increment = (targetProgress / medianTime) * updateInterval
    
    let currentProgress = 0
    
    const interval = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress
        clearInterval(interval)
      }
      setProgressFn(Math.min(currentProgress, targetProgress))
    }, updateInterval)
    
    return interval
  }

  const selectedTag = tags.find(t => t.id === selectedTagId) || tags[0]

  return (
    <>
    <Modal 
      show={show} 
      onHide={() => handleClose()} 
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
        <div className="ai-assistant-section">
          <div className="ai-assistant-header">
          <span className="ai-assistant-label">
            <span>✨</span> Asistente IA
          </span>
            {/* Mode Toggle */}
            <div className="ai-mode-toggle">
              <button
                className={`ai-mode-btn ${aiMode === 'basic' ? 'active' : ''}`}
                onClick={() => setAiMode('basic')}
                disabled={aiLoading}
              >
                Básico
              </button>
              <button
                className={`ai-mode-btn ${aiMode === 'advanced' ? 'active' : ''}`}
                onClick={() => setAiMode('advanced')}
                disabled={aiLoading}
              >
                Avanzado
              </button>
            </div>
          </div>
          <div className="ai-assistant-content">
            {aiMode === 'advanced' && (
            <div className="ai-input-row">
              <div className="ai-input-wrapper">
                <span className="ai-input-icon">🪄</span>
                <input
                  type="text"
                  className="ai-input"
                    placeholder="Instrucciones adicionales (opcional): ej. 'Generar checklist detallado', 'Incluir validaciones', 'Enfocarse en seguridad'..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiLoading}
                />
              </div>
              </div>
            )}
            <div className={`ai-content-bottom ${aiMode === 'basic' ? 'ai-content-basic' : 'ai-content-advanced'}`}>
              <p className="ai-helper-text">
                {aiMode === 'basic' 
                  ? 'La IA generará una descripción útil basada solo en el título y descripción actual.'
                  : 'La IA generará preguntas para entender mejor tu tarea y crear una descripción más precisa.'}
              </p>
              <div className="ai-generate-row">
                <button 
                  className={`ai-generate-btn ${aiLoading ? 'loading' : ''}`}
                  onClick={handleAiGenerate}
                  disabled={aiLoading || (aiMode === 'advanced' && !title.trim())}
                >
                  {aiLoading ? (
                    <div className="ai-loading-content">
                      <div className="ai-spinner-wrapper">
                        <div className="ai-spinner-outer"></div>
                        <div className="ai-spinner-inner"></div>
                        <div className="ai-spinner-core"></div>
                      </div>
                      <span className="ai-loading-text">
                        <span className="ai-loading-dots">
                          <span>G</span>
                          <span>e</span>
                          <span>n</span>
                          <span>e</span>
                          <span>r</span>
                          <span>a</span>
                          <span>n</span>
                          <span>d</span>
                          <span>o</span>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                          <span className="dot">.</span>
                        </span>
                      </span>
                      <div className="ai-sparkles">
                        <span className="sparkle sparkle-1">✨</span>
                        <span className="sparkle sparkle-2">✨</span>
                        <span className="sparkle sparkle-3">✨</span>
                        <span className="sparkle sparkle-4">✨</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>⚡</span> Generar
                    </>
                  )}
              </button>
            </div>
            </div>
            {aiError && (
              <p className="ai-error-text">
                {aiError}
                {isLimitError && (
                  <> ¿Quieres obtener más generaciones? <Link to="/pricing" className="ai-error-link">Echa un vistazo a nuestros planes</Link>.</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <div className="description-header">
          <label className="form-label-modal">Descripción y notas</label>
            <button
              type="button"
              className="markdown-toggle-btn"
              onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
              title={showMarkdownPreview ? "Mostrar editor" : "Mostrar preview"}
            >
              {showMarkdownPreview ? '✏️ Editar' : '👁️ Preview'}
            </button>
          </div>
          {showMarkdownPreview ? (
            <div className="markdown-preview">
              {description.trim() ? (
                <ReactMarkdown>{description}</ReactMarkdown>
              ) : (
                <p className="markdown-preview-empty">No hay descripción. Haz clic en "Editar" para añadir contenido.</p>
              )}
            </div>
          ) : (
          <textarea
            className="form-textarea-modal"
              placeholder="Añade detalles, enlaces o subtareas aquí... (Soporta Markdown)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
          )}
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

    {/* Questions Modal */}
    <Modal 
      show={showQuestionsModal} 
      onHide={() => {
        setShowQuestionsModal(false)
        setAiAnswers({})
        setAiQuestions([])
      }}
      centered 
      size="lg"
      className="questions-modal"
    >
      <div className="modal-header-custom">
        <div className="modal-header-left">
          <div className="modal-icon">
            <span>❓</span>
          </div>
          <div className="modal-header-text">
            <h2 className="modal-title-custom">Preguntas de contexto</h2>
            <p className="modal-subtitle">Responde estas preguntas para mejorar la generación</p>
          </div>
        </div>
        <button 
          className="modal-close-btn" 
          onClick={() => {
            setShowQuestionsModal(false)
            setAiAnswers({})
            setAiQuestions([])
          }}
        >
          <span>✕</span>
        </button>
      </div>

      <div className="modal-body-custom">
        <p className="questions-intro">
          Responde estas preguntas para mejorar la generación. Todas las respuestas son opcionales.
        </p>
        {aiQuestions.map((question, index) => (
          <div key={index} className="question-item">
            <label className="question-label">
              {question}
              <span className="question-optional"> (opcional)</span>
            </label>
            <input
              type="text"
              className="question-input"
              placeholder="Tu respuesta (opcional)..."
              value={aiAnswers[index] || ''}
              onChange={(e) => setAiAnswers({ ...aiAnswers, [index]: e.target.value })}
            />
          </div>
        ))}

        <div className="questions-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              setShowQuestionsModal(false)
              setAiAnswers({})
              setAiQuestions([])
            }}
            disabled={aiLoading}
          >
            Cancelar
          </button>
          <button
            className={`btn-primary ${aiLoading ? 'loading' : ''}`}
            onClick={handleSubmitAnswers}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <div className="ai-loading-content">
                <div className="ai-spinner-wrapper">
                  <div className="ai-spinner-outer"></div>
                  <div className="ai-spinner-inner"></div>
                  <div className="ai-spinner-core"></div>
                </div>
                <span className="ai-loading-text">
                  <span className="ai-loading-dots">
                    <span>G</span>
                    <span>e</span>
                    <span>n</span>
                    <span>e</span>
                    <span>r</span>
                    <span>a</span>
                    <span>n</span>
                    <span>d</span>
                    <span>o</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </span>
                </span>
                <div className="ai-sparkles">
                  <span className="sparkle sparkle-1">✨</span>
                  <span className="sparkle sparkle-2">✨</span>
                  <span className="sparkle sparkle-3">✨</span>
                  <span className="sparkle sparkle-4">✨</span>
                </div>
              </div>
            ) : 'Continuar'}
          </button>
        </div>
      </div>
    </Modal>

    {/* Progress Modal for Advanced Mode */}
    <Modal 
      show={showProgressModal} 
      onHide={() => {}} // Prevent closing during generation
      centered 
      size="sm"
      className="progress-modal"
      backdrop="static"
      keyboard={false}
    >
      <div className="modal-header-custom">
        <div className="modal-header-left">
          <div className="modal-icon">
            <span>✨</span>
          </div>
          <div className="modal-header-text">
            <h2 className="modal-title-custom">Generando con IA</h2>
            <p className="modal-subtitle">Modo avanzado - Esto puede tardar unos segundos</p>
          </div>
        </div>
      </div>

      <div className="modal-body-custom progress-modal-body">
        <div className="progress-container">
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-bar-shine"></div>
            </div>
          </div>
          <div className="progress-text">
            <span className="progress-percentage">{Math.round(progress)}%</span>
            <span className="progress-status">
              {progress < 30 ? 'Analizando tu tarea...' :
               progress < 60 ? 'Generando contenido...' :
               progress < 85 ? 'Refinando detalles...' :
               progress < 100 ? 'Finalizando...' :
               '¡Completado!'}
            </span>
          </div>
        </div>
        
        <div className="progress-animation">
          <div className="progress-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
          </div>
        </div>
      </div>
    </Modal>

    {/* Confirm Close Modal */}
    <ConfirmModal
      show={showConfirmClose}
      onHide={() => setShowConfirmClose(false)}
      onConfirm={handleConfirmClose}
      title="¿Descartar cambios?"
      message="Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?"
      confirmText="Descartar"
      cancelText="Cancelar"
      variant="danger"
    />
    </>
  )
}

export default CardDetail

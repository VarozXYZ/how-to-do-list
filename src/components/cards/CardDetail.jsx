import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import './CardDetail.css'

const CardDetail = ({ show, onHide, onSave }) => {
  const [title, setTitle] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setTitle('')
    setAiPrompt('')
    setDescription('')
    onHide()
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

        {/* Metadata coming next */}
      </div>

      {/* Footer coming next */}
    </Modal>
  )
}

export default CardDetail

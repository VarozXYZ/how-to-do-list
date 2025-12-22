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

      {/* Body coming next */}
      <div className="modal-body-custom">
        {/* Content will be added in next steps */}
      </div>

      {/* Footer coming next */}
    </Modal>
  )
}

export default CardDetail

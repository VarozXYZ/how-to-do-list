import React from 'react'
import { Modal } from 'react-bootstrap'
import './ConfirmModal.css'

const ConfirmModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' or 'warning'
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      className="confirm-modal"
    >
      <div className="confirm-modal-content">
        <div className="confirm-modal-icon">
          {variant === 'danger' ? '⚠️' : '⚠️'}
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn-cancel-confirm" onClick={onHide}>
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-${variant}`} 
            onClick={() => {
              onConfirm()
              onHide()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal


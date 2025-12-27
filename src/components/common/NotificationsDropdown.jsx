import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/notifications'
import './NotificationsDropdown.css'

const NotificationsDropdown = ({ isOpen, onClose, onNotificationChange }) => {
  const { darkMode } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const notificationBtn = event.target.closest('.notification-btn')
        if (!notificationBtn) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (onNotificationChange) onNotificationChange()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
      if (onNotificationChange) onNotificationChange()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id)
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        return prev.filter(n => n.id !== id)
      })
      if (onNotificationChange) onNotificationChange()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} h`
    if (diffDays < 7) return `Hace ${diffDays} d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_due': return '⏰'
      case 'task_completed': return '✅'
      case 'task_created': return '📝'
      case 'ai_limit': return '🤖'
      default: return '🔔'
    }
  }

  if (!isOpen) return null

  return (
    <div ref={dropdownRef} className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notificaciones</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>
      
      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <span>🔕</span>
            <p>No hay notificaciones</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p className="notification-title">{notification.title}</p>
                {notification.message && (
                  <p className="notification-message">{notification.message}</p>
                )}
                <span className="notification-time">{formatDate(notification.createdAt)}</span>
              </div>
              <button
                className="notification-delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(notification.id)
                }}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsDropdown


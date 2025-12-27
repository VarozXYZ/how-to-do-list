const { getDB, saveDB } = require('../config/db')
const log = require('../utils/logger')
const { checkTasksDueSoon } = require('../utils/notificationsHelper')

// Get all notifications for a user
const getNotifications = async (req, res) => {
  const startTime = log.operationStart('Get Notifications', req)
  try {
    log.apiRequest('GET', '/api/notifications', req)
    const userId = req.user.id

    log.operationProgress('Get Notifications', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId })

    // Get user's notifications, sorted by most recent first
    const notifications = (db.notifications || [])
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    log.success('Notifications retrieved', { userId, count: notifications.length })
    log.operationEnd('Get Notifications', startTime, req, { count: notifications.length })
    log.apiResponse('GET', '/api/notifications', 200, req, { count: notifications.length })

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    log.error('Get Notifications failed', error, { userId: req.user.id })
    log.operationEnd('Get Notifications', startTime, req, { error: true })
    log.apiResponse('GET', '/api/notifications', 500, req)
    res.status(500).json({ error: 'Error al obtener notificaciones.' })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  const startTime = log.operationStart('Mark Notification Read', req)
  try {
    log.apiRequest('PUT', '/api/notifications/:id/read', req)
    const { id } = req.params
    const userId = req.user.id

    log.operationProgress('Mark Notification Read', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId, notificationId: id })

    if (!db.notifications) db.notifications = []

    const notificationIndex = db.notifications.findIndex(
      n => n.id === parseInt(id) && n.userId === userId
    )

    if (notificationIndex === -1) {
      log.warn('Notification not found', { userId, notificationId: id })
      log.apiResponse('PUT', '/api/notifications/:id/read', 404, req)
      return res.status(404).json({ error: 'Notificación no encontrada.' })
    }

    db.notifications[notificationIndex].read = true
    db.notifications[notificationIndex].readAt = new Date().toISOString()

    log.operationProgress('Mark Notification Read', 'Saving changes', req)
    saveDB(db)
    log.dbOperation('Notification marked as read', { userId, notificationId: id })

    log.success('Notification marked as read', { userId, notificationId: id })
    log.operationEnd('Mark Notification Read', startTime, req)
    log.apiResponse('PUT', '/api/notifications/:id/read', 200, req)

    res.json({ success: true })
  } catch (error) {
    log.error('Mark Notification Read failed', error, { userId: req.user.id })
    log.operationEnd('Mark Notification Read', startTime, req, { error: true })
    log.apiResponse('PUT', '/api/notifications/:id/read', 500, req)
    res.status(500).json({ error: 'Error al marcar notificación como leída.' })
  }
}

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  const startTime = log.operationStart('Mark All Notifications Read', req)
  try {
    log.apiRequest('PUT', '/api/notifications/read-all', req)
    const userId = req.user.id

    log.operationProgress('Mark All Notifications Read', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId })

    if (!db.notifications) db.notifications = []

    const now = new Date().toISOString()
    let updatedCount = 0

    db.notifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true
        notification.readAt = now
        updatedCount++
      }
    })

    log.operationProgress('Mark All Notifications Read', 'Saving changes', req, { updatedCount })
    saveDB(db)
    log.dbOperation('All notifications marked as read', { userId, updatedCount })

    log.success('All notifications marked as read', { userId, updatedCount })
    log.operationEnd('Mark All Notifications Read', startTime, req, { updatedCount })
    log.apiResponse('PUT', '/api/notifications/read-all', 200, req, { updatedCount })

    res.json({ success: true, updatedCount })
  } catch (error) {
    log.error('Mark All Notifications Read failed', error, { userId: req.user.id })
    log.operationEnd('Mark All Notifications Read', startTime, req, { error: true })
    log.apiResponse('PUT', '/api/notifications/read-all', 500, req)
    res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas.' })
  }
}

// Delete notification
const deleteNotification = async (req, res) => {
  const startTime = log.operationStart('Delete Notification', req)
  try {
    log.apiRequest('DELETE', '/api/notifications/:id', req)
    const { id } = req.params
    const userId = req.user.id

    log.operationProgress('Delete Notification', 'Loading database', req)
    const db = getDB()
    log.dbOperation('Database loaded', { userId, notificationId: id })

    if (!db.notifications) db.notifications = []

    const notificationIndex = db.notifications.findIndex(
      n => n.id === parseInt(id) && n.userId === userId
    )

    if (notificationIndex === -1) {
      log.warn('Notification not found', { userId, notificationId: id })
      log.apiResponse('DELETE', '/api/notifications/:id', 404, req)
      return res.status(404).json({ error: 'Notificación no encontrada.' })
    }

    db.notifications.splice(notificationIndex, 1)

    log.operationProgress('Delete Notification', 'Saving changes', req)
    saveDB(db)
    log.dbOperation('Notification deleted', { userId, notificationId: id })

    log.success('Notification deleted', { userId, notificationId: id })
    log.operationEnd('Delete Notification', startTime, req)
    log.apiResponse('DELETE', '/api/notifications/:id', 200, req)

    res.json({ success: true })
  } catch (error) {
    log.error('Delete Notification failed', error, { userId: req.user.id })
    log.operationEnd('Delete Notification', startTime, req, { error: true })
    log.apiResponse('DELETE', '/api/notifications/:id', 500, req)
    res.status(500).json({ error: 'Error al eliminar notificación.' })
  }
}

// Check for tasks due soon (can be called periodically)
const checkDueTasks = async (req, res) => {
  const startTime = log.operationStart('Check Due Tasks', req)
  try {
    log.apiRequest('POST', '/api/notifications/check-due', req)
    
    checkTasksDueSoon()
    
    log.success('Due tasks checked', { userId: req.user.id })
    log.operationEnd('Check Due Tasks', startTime, req)
    log.apiResponse('POST', '/api/notifications/check-due', 200, req)
    
    res.json({ success: true, message: 'Tareas próximas verificadas' })
  } catch (error) {
    log.error('Check Due Tasks failed', error, { userId: req.user.id })
    log.operationEnd('Check Due Tasks', startTime, req, { error: true })
    log.apiResponse('POST', '/api/notifications/check-due', 500, req)
    res.status(500).json({ error: 'Error al verificar tareas próximas.' })
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkDueTasks
}

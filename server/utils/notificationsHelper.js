const { getDB, saveDB } = require('../config/db')
const log = require('../utils/logger')

/**
 * Create a notification for a user
 * @param {number} userId - User ID
 * @param {string} type - Notification type (task_due, task_completed, task_created, ai_limit, etc.)
 * @param {string} title - Notification title
 * @param {string} message - Notification message (optional)
 * @param {object} metadata - Additional metadata (optional)
 */
const createNotification = (userId, type, title, message = null, metadata = {}) => {
  try {
    const db = getDB()
    
    if (!db.notifications) {
      db.notifications = []
    }

    const notification = {
      id: Math.floor(Date.now() + Math.random() * 1000), // Simple ID generation (integer)
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      ...metadata
    }

    db.notifications.push(notification)
    saveDB(db)
    
    log.info('Notification created', { 
      notificationId: notification.id, 
      userId, 
      type, 
      title: title.substring(0, 50) 
    })

    return notification
  } catch (error) {
    log.error('Failed to create notification', error, { userId, type, title })
    return null
  }
}

/**
 * Check for tasks due soon and create notifications
 * This should be called periodically (e.g., via cron job or on app start)
 */
const checkTasksDueSoon = () => {
  try {
    const db = getDB()
    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours from now

    if (!db.cards || !db.notifications) {
      return
    }

    // Get all active cards with due dates
    const cardsWithDueDates = db.cards.filter(card => 
      card.dueDate && 
      !card.completed &&
      card.dueDate !== ''
    )

    cardsWithDueDates.forEach(card => {
      try {
        const dueDate = new Date(card.dueDate)
        
        // Check if task is due within 24 hours
        if (dueDate >= now && dueDate <= oneDayFromNow) {
          // Check if notification already exists for this task
          const existingNotification = db.notifications.find(n => 
            n.userId === card.userId &&
            n.type === 'task_due' &&
            n.metadata?.cardId === card.id &&
            !n.read &&
            new Date(n.createdAt) > new Date(now.getTime() - 60 * 60 * 1000) // Created in last hour
          )

          if (!existingNotification) {
            const hoursUntilDue = Math.round((dueDate - now) / (1000 * 60 * 60))
            const timeText = hoursUntilDue <= 1 ? 'menos de 1 hora' : `en ${hoursUntilDue} horas`
            
            createNotification(
              card.userId,
              'task_due',
              `Tarea próxima: ${card.title}`,
              `Esta tarea vence ${timeText}`,
              { cardId: card.id }
            )
          }
        }
        // Check if task is due within 2 days (but not within 24 hours)
        else if (dueDate > oneDayFromNow && dueDate <= twoDaysFromNow) {
          const existingNotification = db.notifications.find(n => 
            n.userId === card.userId &&
            n.type === 'task_due' &&
            n.metadata?.cardId === card.id &&
            !n.read &&
            new Date(n.createdAt) > new Date(now.getTime() - 12 * 60 * 60 * 1000) // Created in last 12 hours
          )

          if (!existingNotification) {
            const daysUntilDue = Math.round((dueDate - now) / (1000 * 60 * 60 * 24))
            
            createNotification(
              card.userId,
              'task_due',
              `Tarea próxima: ${card.title}`,
              `Esta tarea vence en ${daysUntilDue} día${daysUntilDue > 1 ? 's' : ''}`,
              { cardId: card.id }
            )
          }
        }
      } catch (error) {
        log.warn('Error processing card for due date notification', { cardId: card.id, error: error.message })
      }
    })
  } catch (error) {
    log.error('Failed to check tasks due soon', error)
  }
}

module.exports = {
  createNotification,
  checkTasksDueSoon
}


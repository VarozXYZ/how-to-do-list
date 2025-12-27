const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkDueTasks
} = require('../controllers/notificationsController')

// All routes require authentication
router.get('/', auth, getNotifications)
router.put('/:id/read', auth, markAsRead)
router.put('/read-all', auth, markAllAsRead)
router.delete('/:id', auth, deleteNotification)
router.post('/check-due', auth, checkDueTasks)

module.exports = router


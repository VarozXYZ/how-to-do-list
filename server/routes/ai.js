const express = require('express')
const router = express.Router()
const { generate, getUsageStats, getLogs } = require('../controllers/aiController')
const auth = require('../middleware/auth')

// All routes require authentication
router.use(auth)

// POST /api/ai/generate - Generate AI content for a task
router.post('/generate', generate)

// GET /api/ai/stats - Get AI usage statistics
router.get('/stats', getUsageStats)

// GET /api/ai/logs - Get AI logs (limited info for regular users)
router.get('/logs', getLogs)

module.exports = router


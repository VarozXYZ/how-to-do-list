const express = require('express')
const router = express.Router()
const { generateBasic, generateAdvanced, generateQuestions, getUsageStats, getLogs } = require('../controllers/aiController')
const auth = require('../middleware/auth')

// All routes require authentication
router.use(auth)

// POST /api/ai/generate-basic - Generate basic AI content (title + description only)
router.post('/generate-basic', generateBasic)

// POST /api/ai/generate-advanced - Generate advanced AI content (with questions answered)
router.post('/generate-advanced', generateAdvanced)

// POST /api/ai/questions - Generate context questions for advanced mode
router.post('/questions', generateQuestions)

// GET /api/ai/stats - Get AI usage statistics
router.get('/stats', getUsageStats)

// GET /api/ai/logs - Get AI logs (limited info for regular users)
router.get('/logs', getLogs)

module.exports = router


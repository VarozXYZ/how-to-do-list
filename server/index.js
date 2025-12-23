require('dotenv').config()
const express = require('express')
const cors = require('cors')

// Initialize database
require('./config/db')

const authRoutes = require('./routes/auth')
const cardsRoutes = require('./routes/cards')
const tagsRoutes = require('./routes/tags')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cards', cardsRoutes)
app.use('/api/tags', tagsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Algo salió mal.' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})


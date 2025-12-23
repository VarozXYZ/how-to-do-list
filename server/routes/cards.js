const express = require('express')
const router = express.Router()
const { getCards, createCard, updateCard, deleteCard, toggleComplete } = require('../controllers/cardsController')
const auth = require('../middleware/auth')

// All routes require authentication
router.use(auth)

router.get('/', getCards)
router.post('/', createCard)
router.put('/:id', updateCard)
router.delete('/:id', deleteCard)
router.patch('/:id/toggle', toggleComplete)

module.exports = router


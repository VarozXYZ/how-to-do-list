const express = require('express')
const router = express.Router()
const { getTags, createTag, deleteTag, toggleFavoriteTag } = require('../controllers/tagsController')
const auth = require('../middleware/auth')

// All routes require authentication
router.use(auth)

router.get('/', getTags)
router.post('/', createTag)
router.delete('/:id', deleteTag)
router.patch('/:id/favorite', toggleFavoriteTag)

module.exports = router


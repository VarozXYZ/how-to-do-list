const express = require('express')
const router = express.Router()
const { getTags, createTag, deleteTag } = require('../controllers/tagsController')
const auth = require('../middleware/auth')

// All routes require authentication
router.use(auth)

router.get('/', getTags)
router.post('/', createTag)
router.delete('/:id', deleteTag)

module.exports = router


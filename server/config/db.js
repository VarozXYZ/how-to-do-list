const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '../data.json')

// Default tags
const defaultTags = [
  { id: 'marketing', name: 'Marketing', color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8', isDefault: true },
  { id: 'personal', name: 'Personal', color: '#faf5ff', borderColor: '#e9d5ff', textColor: '#7c3aed', isDefault: true },
  { id: 'design', name: 'Diseño', color: '#fff7ed', borderColor: '#fed7aa', textColor: '#c2410c', isDefault: true },
  { id: 'work', name: 'Trabajo', color: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#15803d', isDefault: true },
  { id: 'research', name: 'Investigación', color: '#fdf2f8', borderColor: '#fbcfe8', textColor: '#be185d', isDefault: true }
]

// Initialize database
const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [],
      cards: [],
      tags: defaultTags,
      nextUserId: 1,
      nextCardId: 1
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

// Save database
const saveDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// Get database
const getDB = () => {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

// Initialize on load
initDB()

module.exports = { getDB, saveDB, defaultTags }

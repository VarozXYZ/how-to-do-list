import { createContext, useState, useContext } from 'react'

const CardsContext = createContext(null)

// Default tags with colors
const defaultTags = [
  { id: 'marketing', name: 'Marketing', color: '#eff6ff', borderColor: '#bfdbfe', textColor: '#1d4ed8' },
  { id: 'personal', name: 'Personal', color: '#faf5ff', borderColor: '#e9d5ff', textColor: '#7c3aed' },
  { id: 'design', name: 'Diseño', color: '#fff7ed', borderColor: '#fed7aa', textColor: '#c2410c' },
  { id: 'work', name: 'Trabajo', color: '#f0fdf4', borderColor: '#bbf7d0', textColor: '#15803d' },
  { id: 'research', name: 'Investigación', color: '#fdf2f8', borderColor: '#fbcfe8', textColor: '#be185d' }
]

// Example cards using tags
const initialCards = [
  {
    id: 1,
    title: 'Plan Q3 Strategy',
    description: 'Draft initial outline based on Q3 goals, focusing on social media growth.',
    tagId: 'marketing',
    completed: false
  },
  {
    id: 2,
    title: 'Comprar víveres',
    description: 'Leche, huevos, pan y verduras orgánicas para la semana.',
    tagId: 'personal',
    completed: false
  },
  {
    id: 3,
    title: 'Actualizar Hero del sitio',
    description: 'Reemplazar la imagen actual con el nuevo render 3D y actualizar los botones CTA.',
    tagId: 'design',
    completed: false
  },
  {
    id: 4,
    title: 'Sync del equipo',
    description: 'Reunión semanal con el equipo de desarrollo para discutir el progreso del sprint.',
    tagId: 'work',
    completed: false
  },
  {
    id: 5,
    title: 'Análisis de competencia',
    description: 'Revisar los modelos de precios y características de los 3 principales competidores.',
    tagId: 'research',
    completed: false
  }
]

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState(initialCards)
  const [tags, setTags] = useState(defaultTags)

  const addCard = (newCard) => {
    setCards([newCard, ...cards])
  }

  const deleteCard = (id) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const toggleComplete = (id) => {
    setCards(cards.map(card =>
      card.id === id ? { ...card, completed: !card.completed } : card
    ))
  }

  const addTag = (newTag) => {
    const tagId = newTag.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    setTags([...tags, { ...newTag, id: tagId }])
    return tagId
  }

  const getTagById = (tagId) => {
    return tags.find(tag => tag.id === tagId) || tags[0]
  }

  const activeCards = cards.filter(card => !card.completed)
  const completedCards = cards.filter(card => card.completed)

  const value = {
    cards,
    activeCards,
    completedCards,
    tags,
    addCard,
    deleteCard,
    toggleComplete,
    addTag,
    getTagById
  }

  return (
    <CardsContext.Provider value={value}>
      {children}
    </CardsContext.Provider>
  )
}

export const useCards = () => {
  const context = useContext(CardsContext)
  if (!context) {
    throw new Error('useCards must be used within a CardsProvider')
  }
  return context
}

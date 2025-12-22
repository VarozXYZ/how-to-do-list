import { createContext, useState, useContext } from 'react'

const CardsContext = createContext(null)

// Example cards
const initialCards = [
  {
    id: 1,
    title: 'Plan Q3 Strategy',
    description: 'Draft initial outline based on Q3 goals, focusing on social media growth.',
    category: 'Marketing',
    completed: false,
    aiEnhanced: true
  },
  {
    id: 2,
    title: 'Buy Groceries',
    description: 'Milk, Eggs, Bread, and organic vegetables for the week.',
    category: 'Personal',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 3,
    title: 'Update Website Hero',
    description: 'Replace current image with the new 3D render and update CTA buttons.',
    category: 'Design',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 4,
    title: 'Team Sync',
    description: 'Weekly sync with the development team to discuss sprint progress.',
    category: 'Work',
    completed: false,
    aiEnhanced: false
  },
  {
    id: 5,
    title: 'Competitor Analysis',
    description: "Review top 3 competitors' pricing models and feature sets.",
    category: 'Research',
    completed: false,
    aiEnhanced: false
  }
]

export const CardsProvider = ({ children }) => {
  const [cards, setCards] = useState(initialCards)

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

  const activeCards = cards.filter(card => !card.completed)
  const completedCards = cards.filter(card => card.completed)

  const value = {
    cards,
    activeCards,
    completedCards,
    addCard,
    deleteCard,
    toggleComplete
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


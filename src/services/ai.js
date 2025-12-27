import api from './api'

// Get AI usage statistics
export const getAiStats = async () => {
  const response = await api.get('/ai/stats')
  return response.data
}

// Generate context questions for advanced mode
export const generateContextQuestions = async (title, description, userPrompt) => {
  const response = await api.post('/ai/questions', {
    title,
    description,
    userPrompt
  })
  return response.data
}

// Generate content in basic mode (title + description only)
export const generateBasicContent = async (title, description, cardId = null) => {
  const response = await api.post('/ai/generate-basic', {
    title,
    description,
    cardId
  })
  return response.data
}

// Generate content in advanced mode (with questions answered)
export const generateAdvancedContent = async (title, description, userPrompt, answers, cardId = null) => {
  const response = await api.post('/ai/generate-advanced', {
    title,
    description,
    userPrompt,
    answers,
    cardId
  })
  return response.data
}


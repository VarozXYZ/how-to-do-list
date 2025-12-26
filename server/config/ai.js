const OpenAI = require('openai')

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

// System prompts
const SYSTEM_PROMPTS = {
  moderation: `You are a content moderation assistant. Your job is to determine if user content is appropriate for a task management application.

REJECT content that contains:
- Racial slurs or hate speech
- Explicit sexual content
- Extreme violence or gore
- Illegal activities
- Personal attacks or harassment
- Spam or gibberish

ACCEPT content that is:
- Task-related (work, personal, study, projects)
- Professional or casual language
- Any language (Spanish, English, etc.)

Respond ONLY with a JSON object:
- If acceptable: {"approved": true}
- If not acceptable: {"approved": false, "reason": "Brief explanation in Spanish"}`,

  generation: `Eres un asistente de productividad experto. Tu trabajo es ayudar a los usuarios a mejorar y completar sus tareas.

Cuando el usuario te proporcione información sobre una tarea (título, descripción actual, y/o instrucciones adicionales), debes:

1. Generar una descripción clara, concisa y útil para la tarea
2. Incluir pasos accionables si es apropiado
3. Mantener un tono profesional pero amigable
4. Responder siempre en español
5. No exceder 300 palabras

Tu respuesta debe ser SOLO el texto de la descripción mejorada, sin explicaciones adicionales ni formato especial.`
}

// AI generation function
const generateTaskContent = async (title, currentDescription, userPrompt) => {
  const userMessage = `
Título de la tarea: ${title}
${currentDescription ? `Descripción actual: ${currentDescription}` : ''}
${userPrompt ? `Instrucciones adicionales: ${userPrompt}` : ''}

Por favor, genera una descripción mejorada y útil para esta tarea.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.generation },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  return completion.choices[0].message.content
}

// Content moderation function
const moderateContent = async (title, description, userPrompt) => {
  const contentToCheck = `Title: ${title}\nDescription: ${description || ''}\nUser prompt: ${userPrompt || ''}`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.moderation },
      { role: 'user', content: contentToCheck }
    ],
    temperature: 0,
    max_tokens: 100
  })

  try {
    const response = completion.choices[0].message.content
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    // Default to approved if parsing fails but no rejection indicators
    return { approved: true }
  } catch (error) {
    console.error('Error parsing moderation response:', error)
    return { approved: true } // Default to approved on parse error
  }
}

module.exports = {
  openai,
  generateTaskContent,
  moderateContent,
  SYSTEM_PROMPTS
}


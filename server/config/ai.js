const OpenAI = require('openai')

// Initialize OpenAI client with DeepSeek configuration
// Only initialize if API key is present
let openai = null
if (process.env.DEEPSEEK_API_KEY) {
  openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
  })
}

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

Tu respuesta debe ser SOLO el texto de la descripción mejorada, sin explicaciones adicionales ni formato especial.`,

  questions: `Eres un asistente de productividad experto. Tu trabajo es generar entre 2 y 5 preguntas relevantes para entender mejor una tarea y poder generar una descripción más precisa.

Basándote en el título, descripción y contexto proporcionado, genera preguntas que ayuden a:
- Entender el contexto y objetivos de la tarea
- Identificar requisitos específicos
- Conocer limitaciones o consideraciones importantes
- Definir el alcance y prioridades

Responde SOLO con un array JSON de strings, cada string es una pregunta. Ejemplo:
["¿Cuál es el objetivo principal de esta tarea?", "¿Hay alguna fecha límite o restricción de tiempo?"]

Genera entre 2 y 5 preguntas, siempre en español.`,

  advancedGeneration: `Eres un asistente de productividad experto. Tu trabajo es GENERAR una descripción nueva y útil para una tarea.

REGLAS CRÍTICAS:
- NO repitas el título de la tarea en tu respuesta
- NO repitas las instrucciones o el contexto proporcionado literalmente
- NO uses frases como "Preparar una tarta..." si eso ya está en el título
- GENERA contenido nuevo que explique CÓMO realizar la tarea, no QUÉ es la tarea
- La descripción debe ser útil para completar la tarea, con pasos accionables

Ejemplo:
Si el título es "Preparar una tarta de manzana" y el usuario dice "apta para 5 personas, sin azúcar", 
NO escribas: "Preparar una tarta de manzana casera, apta para 5 personas, sin azúcar..."
ESCRIBE: "Receta para 5 personas. Usar endulzantes naturales como canela o puré de manzana. Pasos: preparar masa, cortar manzanas, condimentar, armar y hornear a 180°C por 45 minutos."

Debes:
1. Generar una descripción clara, concisa y útil que explique cómo realizar la tarea
2. Incorporar la información proporcionada de forma natural, sin repetirla literalmente
3. Incluir pasos accionables concretos
4. Mantener un tono profesional pero amigable
5. Responder siempre en español
6. No exceder 300 palabras

Tu respuesta debe ser ÚNICAMENTE el texto de la descripción generada, sin explicaciones adicionales, sin formato especial, sin repetir el título ni las instrucciones.`
}

// AI generation function
const generateTaskContent = async (title, currentDescription, userPrompt) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

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
    temperature: 0.7
  })

  return completion.choices[0].message.content
}

// Content moderation function
const moderateContent = async (title, description, userPrompt) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

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

// Generate context questions for advanced mode
const generateContextQuestions = async (title, description, userPrompt) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  const userMessage = `
Título de la tarea: ${title}
${description ? `Descripción actual: ${description}` : ''}
${userPrompt ? `Contexto adicional: ${userPrompt}` : ''}

Genera entre 2 y 5 preguntas relevantes para entender mejor esta tarea y poder generar una descripción más precisa.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.questions },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 300
  })

  try {
    const response = completion.choices[0].message.content
    // Try to parse JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0])
      return Array.isArray(questions) ? questions : []
    }
    // If no JSON found, try to extract questions from text
    const lines = response.split('\n').filter(line => line.trim() && (line.includes('?') || line.match(/^\d+[\.\)]/)))
    return lines.map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()).filter(q => q.length > 0)
  } catch (error) {
    console.error('Error parsing questions response:', error)
    return []
  }
}

// Generate basic content (title + description only)
const generateBasicTaskContent = async (title, description) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  const userMessage = `
Título de la tarea: ${title}
${description ? `Descripción actual: ${description}` : ''}

Por favor, genera una descripción mejorada y útil para esta tarea basándote solo en el título y la descripción actual.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.generation },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7
  })

  return completion.choices[0].message.content
}

// Generate advanced content (with questions answered)
const generateAdvancedTaskContent = async (title, description, userPrompt, answers) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  const answersText = Object.entries(answers)
    .map(([index, answer]) => `Respuesta ${parseInt(index) + 1}: ${answer}`)
    .join('\n')

  const userMessage = `Basándote en la siguiente información, GENERA una descripción nueva y útil para esta tarea:

Título: ${title}
${description ? `Descripción actual: ${description}` : ''}
${userPrompt ? `Contexto adicional: ${userPrompt}` : ''}
${Object.keys(answers).length > 0 ? `\nInformación adicional del usuario:\n${answersText}` : ''}

IMPORTANTE: Genera una descripción nueva que explique CÓMO realizar esta tarea. NO repitas el título ni las instrucciones. Crea contenido útil y accionable.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.advancedGeneration },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7
  })

  return completion.choices[0].message.content
}

// Check if AI is available
const isAiAvailable = () => !!openai

module.exports = {
  openai,
  generateTaskContent,
  generateBasicTaskContent,
  generateAdvancedTaskContent,
  generateContextQuestions,
  moderateContent,
  isAiAvailable,
  SYSTEM_PROMPTS
}


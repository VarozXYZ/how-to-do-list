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

  // Base generation prompt - will be enhanced with personality
  generationBase: `Eres un asistente de productividad experto. Tu trabajo es ayudar a los usuarios a mejorar y completar sus tareas.

Cuando el usuario te proporcione información sobre una tarea (título, descripción actual, y/o instrucciones adicionales), debes:

1. Generar una descripción DETALLADA, completa y útil para la tarea
2. Incluir pasos accionables específicos y concretos
3. Proporcionar información suficiente para que el usuario pueda completar la tarea sin dudas
4. Responder siempre en español
5. Sé exhaustivo y detallado - no te limites a respuestas cortas

Tu respuesta debe ser SOLO el texto de la descripción mejorada, sin explicaciones adicionales ni formato especial.`,

  // Basic generation prompt - balanced: useful but concise for quick responses
  basicGenerationBase: `Eres un asistente de productividad experto. Tu trabajo es generar una descripción útil y práctica para una tarea.

IMPORTANTE - MODO BÁSICO (EQUILIBRADO):
- Sé CONCISO pero COMPLETO - proporciona información útil sin ser excesivo
- Incluye 4-7 pasos accionables claros y específicos
- Proporciona detalles prácticos necesarios para completar la tarea
- Incluye información relevante como tiempos, cantidades, o consideraciones importantes cuando sea apropiado
- Responde siempre en español
- Balance: más rápido que el modo avanzado, pero lo suficientemente detallado para ser útil

Tu respuesta debe ser SOLO el texto de la descripción, sin explicaciones adicionales ni formato especial.`,

  questions: `Eres un asistente de productividad experto. Tu trabajo es generar preguntas relevantes para entender mejor una tarea y poder generar una descripción más precisa.

IMPORTANTE:
- Genera entre 2 y 5 preguntas útiles que ayuden a mejorar la descripción de la tarea
- NO generes preguntas sobre información que ya está claramente proporcionada en el título o descripción
- Si el usuario proporcionó contexto adicional, úsalo para evitar preguntas redundantes, pero aún así genera preguntas complementarias útiles
- Las preguntas deben ayudar a obtener información adicional que mejore la calidad de la descripción final

Basándote en el título, descripción y contexto proporcionado, genera preguntas que ayuden a:
- Entender mejor el contexto y objetivos específicos de la tarea
- Identificar requisitos, preferencias o detalles importantes
- Conocer limitaciones, restricciones o consideraciones relevantes
- Definir el alcance, prioridades o resultados esperados

Responde SOLO con un array JSON de strings, cada string es una pregunta. Ejemplo:
["¿Cuál es el objetivo principal de esta tarea?", "¿Hay alguna fecha límite o restricción de tiempo?", "¿Qué resultado específico esperas obtener?"]

Genera entre 2 y 5 preguntas útiles, siempre en español. Si ya hay mucho contexto, genera al menos 2 preguntas complementarias.`,

  advancedGenerationBase: `Eres un asistente de productividad experto. Tu trabajo es GENERAR una descripción nueva y útil para una tarea.

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
1. Generar una descripción DETALLADA, completa y exhaustiva que explique cómo realizar la tarea paso a paso
2. Incorporar la información proporcionada de forma natural, sin repetirla literalmente
3. Incluir pasos accionables específicos, concretos y detallados
4. Proporcionar suficiente contexto y detalles para que el usuario pueda completar la tarea sin dudas
5. Mantener un tono profesional pero amigable
6. Responder siempre en español
7. Sé exhaustivo - proporciona todos los detalles necesarios, no te limites a respuestas cortas

Tu respuesta debe ser ÚNICAMENTE el texto de la descripción generada, sin explicaciones adicionales, sin formato especial, sin repetir el título ni las instrucciones.`
}

// Convert creativity (0-100) to temperature (0-1.5)
const creativityToTemperature = (creativity) => {
  // Map 0-100 to 0-1.5 (DeepSeek's full range)
  // 0 = 0 (more precise), 100 = 1.5 (more creative)
  return (creativity / 100) * 1.5
}

// Generate system prompt with personality context
const getGenerationPrompt = (personality = 'professional', username = null) => {
  const basePrompt = SYSTEM_PROMPTS.generationBase
  
  let personalityInstructions = ''
  
  switch (personality) {
    case 'friendly':
      personalityInstructions = `
TONO Y ESTILO (Personalidad Amigable):
- Usa un tono cálido, cercano y motivador
- Puedes usar emojis de forma moderada cuando sea apropiado (no exageres)
- Si conoces el nombre del usuario (${username ? username : 'el usuario'}), puedes referirte a él/ella por su nombre de forma natural
- Sé entusiasta y positivo, pero mantén el foco en la productividad
- Puedes usar frases como "¡Perfecto!", "Genial", "Excelente" cuando sea apropiado
- Haz que la descripción se sienta como si un amigo te estuviera ayudando`
      break
      
    case 'analytical':
      personalityInstructions = `
TONO Y ESTILO (Personalidad Analítica):
- Proporciona datos, métricas y contexto adicional cuando sea relevante
- Sé detallado y exhaustivo en las explicaciones
- Incluye consideraciones técnicas, mejores prácticas y alternativas
- Estructura la información de forma lógica y organizada
- Proporciona contexto sobre por qué ciertos pasos son importantes
- Incluye posibles problemas o consideraciones que el usuario debería tener en cuenta`
      break
      
    case 'professional':
    default:
      personalityInstructions = `
TONO Y ESTILO (Personalidad Profesional):
- Mantén un tono conciso, directo y enfocado en la productividad
- Sé claro y específico sin ser demasiado formal
- Evita emojis y lenguaje casual
- Enfócate en la eficiencia y resultados
- Proporciona información práctica y accionable`
      break
  }
  
  return basePrompt + personalityInstructions
}

// Generate advanced system prompt with personality context
const getAdvancedGenerationPrompt = (personality = 'professional', username = null) => {
  const basePrompt = SYSTEM_PROMPTS.advancedGenerationBase
  
  let personalityInstructions = ''
  
  switch (personality) {
    case 'friendly':
      personalityInstructions = `
TONO Y ESTILO (Personalidad Amigable):
- Usa un tono cálido, cercano y motivador
- Puedes usar emojis de forma moderada cuando sea apropiado (no exageres)
- Si conoces el nombre del usuario (${username ? username : 'el usuario'}), puedes referirte a él/ella por su nombre de forma natural
- Sé entusiasta y positivo, pero mantén el foco en la productividad
- Puedes usar frases como "¡Perfecto!", "Genial", "Excelente" cuando sea apropiado
- Haz que la descripción se sienta como si un amigo te estuviera ayudando`
      break
      
    case 'analytical':
      personalityInstructions = `
TONO Y ESTILO (Personalidad Analítica):
- Proporciona datos, métricas y contexto adicional cuando sea relevante
- Sé detallado y exhaustivo en las explicaciones
- Incluye consideraciones técnicas, mejores prácticas y alternativas
- Estructura la información de forma lógica y organizada
- Proporciona contexto sobre por qué ciertos pasos son importantes
- Incluye posibles problemas o consideraciones que el usuario debería tener en cuenta`
      break
      
    case 'professional':
    default:
      personalityInstructions = `
TONO Y ESTILO (Personalidad Profesional):
- Mantén un tono conciso, directo y enfocado en la productividad
- Sé claro y específico sin ser demasiado formal
- Evita emojis y lenguaje casual
- Enfócate en la eficiencia y resultados
- Proporciona información práctica y accionable`
      break
  }
  
  return basePrompt + personalityInstructions
}

// AI generation function
const generateTaskContent = async (title, currentDescription, userPrompt, temperature = 0.8) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  const systemPrompt = getGenerationPrompt(personality, username)

  const userMessage = `
Título de la tarea: ${title}
${currentDescription ? `Descripción actual: ${currentDescription}` : ''}
${userPrompt ? `Instrucciones adicionales: ${userPrompt}` : ''}

Por favor, genera una descripción mejorada y útil para esta tarea.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: temperature
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
${userPrompt ? `Contexto adicional proporcionado por el usuario: ${userPrompt}` : ''}

IMPORTANTE: 
- Genera entre 2 y 5 preguntas útiles que complementen la información proporcionada
- NO generes preguntas sobre información que ya está claramente en el título o descripción
- Si hay contexto adicional del usuario, úsalo para evitar redundancias, pero genera preguntas complementarias
- Las preguntas deben ayudar a obtener detalles adicionales que mejoren la descripción final
- Si ya hay mucho contexto, genera al menos 2 preguntas complementarias o de profundización

Genera entre 2 y 5 preguntas útiles que ayuden a entender mejor esta tarea y poder generar una descripción más precisa.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.questions },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.8,
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

// Generate basic content (title + description only) - SIMPLE and FAST
const generateBasicTaskContent = async (title, description, temperature = 0.6, personality = 'professional', username = null) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  // Use simpler prompt for basic mode
  const basePrompt = SYSTEM_PROMPTS.basicGenerationBase
  
  let personalityInstructions = ''
  
  switch (personality) {
    case 'friendly':
      personalityInstructions = `
TONO (Amigable): Tono cálido y motivador. Puedes usar emojis moderadamente.`
      break
      
    case 'analytical':
      personalityInstructions = `
TONO (Analítico): Sé preciso y estructurado, pero mantén la brevedad.`
      break
      
    case 'professional':
    default:
      personalityInstructions = `
TONO (Profesional): Conciso, directo y enfocado.`
      break
  }
  
  const systemPrompt = basePrompt + personalityInstructions

  const userMessage = `
Título de la tarea: ${title}
${description ? `Descripción actual: ${description}` : ''}

Genera una descripción útil y práctica para esta tarea. Incluye pasos claros y detalles relevantes, pero mantén un equilibrio entre concisión y utilidad.`

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: temperature
  })

  return completion.choices[0].message.content
}

// Generate advanced content (with questions answered)
const generateAdvancedTaskContent = async (title, description, userPrompt, answers, temperature = 0.8, personality = 'professional', username = null) => {
  if (!openai) {
    throw new Error('AI service not configured. Missing DEEPSEEK_API_KEY.')
  }

  const systemPrompt = getAdvancedGenerationPrompt(personality, username)

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
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: temperature,
    extra_body: { thinking: { type: "enabled" } }
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
  creativityToTemperature,
  getGenerationPrompt,
  getAdvancedGenerationPrompt,
  SYSTEM_PROMPTS
}


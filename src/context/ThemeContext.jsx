import { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedPrefs = localStorage.getItem('userPreferences')
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      return prefs.darkMode ?? false
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const toggleDarkMode = (value) => {
    const newValue = typeof value === 'boolean' ? value : !darkMode
    setDarkMode(newValue)
    
    // Update localStorage
    const savedPrefs = localStorage.getItem('userPreferences')
    const prefs = savedPrefs ? JSON.parse(savedPrefs) : {}
    prefs.darkMode = newValue
    localStorage.setItem('userPreferences', JSON.stringify(prefs))
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


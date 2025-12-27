import { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedPrefs = localStorage.getItem('userPreferences')
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      if (prefs.darkMode !== undefined) {
        return prefs.darkMode
      }
    }
    // Check system preference if no manual preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Listen to system theme changes and update if no manual preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedPrefs = localStorage.getItem('userPreferences')
      const hasManualPref = savedPrefs && JSON.parse(savedPrefs).darkMode !== undefined
      
      if (!hasManualPref) {
        setDarkMode(e.matches)
      }
    }

    // Check initial state - only listen if no manual preference
    const savedPrefs = localStorage.getItem('userPreferences')
    const hasManualPref = savedPrefs && JSON.parse(savedPrefs).darkMode !== undefined
    
    if (!hasManualPref) {
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } 
      // Fallback for older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, []) // Only set up listener once on mount

  // Apply dark mode class to body and update favicon
  useEffect(() => {
    // Update favicon immediately based on initial theme
    const updateFavicon = (isDark) => {
      const favicon = document.getElementById('favicon')
      if (favicon) {
        if (isDark) {
          // Dark theme → white icon
          favicon.href = 'https://res.cloudinary.com/diycpogap/image/upload/v1766779021/white-icon_gb5uwc.png'
        } else {
          // Light theme → dark icon
          favicon.href = 'https://res.cloudinary.com/diycpogap/image/upload/v1766779088/dark-icon_hgacxb.png'
        }
      }
    }

    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
      updateFavicon(true)
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
      updateFavicon(false)
    }
  }, [darkMode])

  const toggleDarkMode = (value) => {
    const newValue = typeof value === 'boolean' ? value : !darkMode
    setDarkMode(newValue)
    
    // Update localStorage - mark as manual preference
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


import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button 
      className="theme-toggle"
      onClick={() => toggleDarkMode()}
      title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-label={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle


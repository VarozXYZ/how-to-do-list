import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CardsProvider } from './context/CardsContext'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './pages/Dashboard'
import Completed from './pages/Completed'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <CardsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/completed" element={<Completed />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </CardsProvider>
    </BrowserRouter>
  )
} 

export default App

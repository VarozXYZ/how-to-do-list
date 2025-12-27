import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/common/ThemeToggle'
import './Pricing.css'

const Pricing = () => {
  const { user, updatePlan } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  const handleUpgrade = async () => {
    // TODO: Implement payment gateway
    // For now, just show a message
    alert('La pasarela de pago se implementará próximamente. Por ahora, puedes contactar al administrador para actualizar tu plan.')
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 'Gratis',
      description: 'Perfecto para empezar',
      features: [
        'Hasta 50 generaciones de IA',
        'Todas las funciones básicas',
        'Soporte por email',
        'Acceso completo a la plataforma'
      ],
      limit: 50,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 'Próximamente',
      description: 'Para usuarios avanzados',
      features: [
        'Generaciones de IA ilimitadas',
        'Todas las funciones básicas',
        'Soporte prioritario',
        'Acceso completo a la plataforma',
        'Funciones premium futuras'
      ],
      limit: null,
      popular: true
    }
  ]

  const currentPlan = user?.plan || 'free'
  const isAdmin = user?.isAdmin || false

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h2 className="header-title">Planes y Precios</h2>
            <p className="header-subtitle">Elige el plan que mejor se adapte a tus necesidades</p>
          </div>
          <div className="header-right">
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="pricing-content">
          <div className="pricing-grid">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan || (plan.id === 'pro' && isAdmin)
              const isUpgrade = plan.id === 'pro' && currentPlan === 'free' && !isAdmin
              
              return (
                <div 
                  key={plan.id} 
                  className={`pricing-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                >
                  {plan.popular && (
                    <div className="popular-badge">Más Popular</div>
                  )}
                  {isCurrentPlan && (
                    <div className="current-badge">Tu Plan Actual</div>
                  )}
                  
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price-amount">{plan.price}</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                  </div>

                  <div className="plan-features">
                    <ul>
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <span className="feature-icon">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-footer">
                    {isCurrentPlan ? (
                      <button className="plan-button current-button" disabled>
                        Plan Actual
                      </button>
                    ) : isUpgrade ? (
                      <button 
                        className="plan-button upgrade-button"
                        onClick={handleUpgrade}
                      >
                        Actualizar a Pro
                      </button>
                    ) : (
                      <button className="plan-button" disabled>
                        No Disponible
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {isAdmin && (
            <div className="admin-notice">
              <p>👑 Eres administrador - Tienes acceso ilimitado a todas las funciones</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Pricing


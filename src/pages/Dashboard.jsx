import { Container, Row, Col } from 'react-bootstrap'
import Sidebar from '../components/layout/Sidebar'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header coming next */}
      </main>
    </div>
  )
}

export default Dashboard

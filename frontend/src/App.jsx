import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import UploadPage from './components/UploadPage'
import ListPage from './components/ListPage'
import ScorecardPage from './components/ScorecardPage'
import DashboardPage from './components/DashboardPage'
import LoginPage from './components/LoginPage'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit" element={<UploadPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/results" element={<PrivateRoute><ListPage /></PrivateRoute>} />
        <Route path="/score/:id" element={<PrivateRoute><ScorecardPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

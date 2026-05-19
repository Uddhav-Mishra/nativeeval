import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import UploadPage from './components/UploadPage'
import ListPage from './components/ListPage'
import ScorecardPage from './components/ScorecardPage'
import DashboardPage from './components/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit" element={<UploadPage />} />
        <Route path="/results" element={<ListPage />} />
        <Route path="/score/:id" element={<ScorecardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

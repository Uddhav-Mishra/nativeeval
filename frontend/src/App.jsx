import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UploadPage from './components/UploadPage'
import ScorecardPage from './components/ScorecardPage'
import DashboardPage from './components/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/score/:id" element={<ScorecardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

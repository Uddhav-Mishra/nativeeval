import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './components/Landing'
import Workspace from './components/Workspace'
import Scorecard from './components/Scorecard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/scorecard/:id" element={<Scorecard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const creds = sessionStorage.getItem('dashboard_creds')
  if (!creds) return <Navigate to="/login" replace />
  return children
}

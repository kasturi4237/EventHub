import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const allowed = roles || (role ? [role] : null)
  if (allowed && !allowed.includes(user.role)) return <Navigate to="/" replace />
  return children
}

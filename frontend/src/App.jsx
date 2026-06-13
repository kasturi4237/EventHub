import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import MyBookings from './pages/MyBookings'
import CheckIn from './pages/CheckIn'
import LoadingSpinner from './components/LoadingSpinner'

function RoleRedirect() {
  const { user } = useAuth()
  if (user?.role === 'organizer') return <Navigate to="/dashboard" replace />
  if (user?.role === 'staff') return <Navigate to="/checkin" replace />
  return <Navigate to="/events" replace />
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-violet-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/dashboard" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="/events/new" element={
          <ProtectedRoute role="organizer"><CreateEvent /></ProtectedRoute>
        } />
        <Route path="/events/:id/edit" element={
          <ProtectedRoute role="organizer"><EditEvent /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute role="attendee"><MyBookings /></ProtectedRoute>
        } />
        <Route path="/checkin" element={
          <ProtectedRoute roles={['staff', 'organizer']}><CheckIn /></ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute><RoleRedirect /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

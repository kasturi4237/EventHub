import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, LogOut, User, LayoutDashboard, Ticket, QrCode, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false) }
  const active = (path) => location.pathname === path ? 'text-violet-700 font-semibold' : 'text-gray-600 hover:text-violet-600'

  return (
    <nav className="bg-white border-b border-violet-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-violet-700">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-white" />
            </div>
            EventHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className={`text-sm ${active('/events')} transition-colors`}>Browse Events</Link>
            {user?.role === 'organizer' && (
              <Link to="/dashboard" className={`text-sm ${active('/dashboard')} transition-colors flex items-center gap-1`}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            )}
            {user?.role === 'attendee' && (
              <Link to="/my-bookings" className={`text-sm ${active('/my-bookings')} transition-colors flex items-center gap-1`}>
                <Ticket size={15} /> My Tickets
              </Link>
            )}
            {(user?.role === 'staff' || user?.role === 'organizer') && (
              <Link to="/checkin" className={`text-sm ${active('/checkin')} transition-colors flex items-center gap-1`}>
                <QrCode size={15} /> Check-in
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">
                  <div className="w-6 h-6 bg-violet-200 rounded-full flex items-center justify-center">
                    <User size={12} className="text-violet-700" />
                  </div>
                  <span className="text-sm font-medium text-violet-700">{user.name.split(' ')[0]}</span>
                  <span className="text-xs text-violet-400 capitalize bg-white px-1.5 py-0.5 rounded-lg border border-violet-100">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm text-gray-500 hover:text-red-500">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-violet-50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-violet-100 py-4 flex flex-col gap-3">
            <Link to="/events" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-2 px-2 hover:bg-violet-50 rounded-lg">Browse Events</Link>
            {user?.role === 'organizer' && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-2 px-2 hover:bg-violet-50 rounded-lg">Dashboard</Link>}
            {user?.role === 'attendee' && <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-2 px-2 hover:bg-violet-50 rounded-lg">My Tickets</Link>}
            {(user?.role === 'staff' || user?.role === 'organizer') && <Link to="/checkin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600 py-2 px-2 hover:bg-violet-50 rounded-lg">Check-in</Link>}
            {user ? (
              <button onClick={handleLogout} className="text-sm text-red-500 py-2 px-2 hover:bg-red-50 rounded-lg text-left">Sign Out</button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Calendar, Ticket, TrendingUp, Users, Edit2, Trash2, Eye, CheckCircle } from 'lucide-react'

const STATUS_BADGE = {
  published: 'badge-confirmed',
  draft: 'badge text-gray-500 bg-gray-50 border border-gray-100',
  cancelled: 'badge-cancelled'
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events/organizer/my-events')
      setEvents(data)
    } catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await api.delete(`/events/${id}`)
      toast.success('Event deleted')
      setEvents(ev => ev.filter(e => e._id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const totalBookings = events.reduce((s, e) => s + (e.totalBookings || 0), 0)
  const totalRevenue = events.reduce((s, e) => s + (e.revenue || 0), 0)
  const totalCheckedIn = events.reduce((s, e) => s + (e.checkedIn || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header">Organizer Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <Link to="/events/new" className="btn-primary">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="stat-card">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center mb-2">
            <Calendar size={16} className="text-violet-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{events.length}</div>
          <div className="text-xs text-gray-400 font-medium">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
            <Ticket size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{totalBookings}</div>
          <div className="text-xs text-gray-400 font-medium">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {totalRevenue === 0 ? 'FREE' : `₹${totalRevenue.toLocaleString()}`}
          </div>
          <div className="text-xs text-gray-400 font-medium">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <CheckCircle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{totalCheckedIn}</div>
          <div className="text-xs text-gray-400 font-medium">Checked In</div>
        </div>
      </div>

      {/* Events table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900 text-lg">Your Events</h2>
          <Link to="/events/new" className="btn-secondary text-sm py-2 px-3">
            <Plus size={14} /> New
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={48} className="text-violet-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-400 mb-2">No events yet</h3>
            <p className="text-sm text-gray-300 mb-6">Create your first event to get started</p>
            <Link to="/events/new" className="btn-primary text-sm">
              <Plus size={15} /> Create Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-violet-50">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Event</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Bookings</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Revenue</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id} className="border-b border-violet-50 hover:bg-violet-25 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: ev.bannerColor || '#7C3AED' }} />
                        <div>
                          <div className="font-semibold text-gray-800 truncate max-w-[180px]">{ev.title}</div>
                          <div className="text-xs text-gray-400">{ev.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-500 hidden md:table-cell">
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-3 hidden lg:table-cell">
                      <span className={STATUS_BADGE[ev.status] || STATUS_BADGE.draft + ' capitalize'}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="font-semibold text-gray-700">{ev.totalBookings || 0}</div>
                      <div className="text-xs text-violet-400">{ev.checkedIn || 0} in</div>
                    </td>
                    <td className="py-4 px-3 text-right font-semibold text-gray-700 hidden md:table-cell">
                      {ev.revenue === 0 ? '—' : `₹${ev.revenue?.toLocaleString()}`}
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/events/${ev._id}`} className="p-2 hover:bg-violet-50 rounded-lg transition-colors text-gray-400 hover:text-violet-600" title="View">
                          <Eye size={15} />
                        </Link>
                        <Link to={`/events/${ev._id}/edit`} className="p-2 hover:bg-violet-50 rounded-lg transition-colors text-gray-400 hover:text-violet-600" title="Edit">
                          <Edit2 size={15} />
                        </Link>
                        <button onClick={() => handleDelete(ev._id, ev.title)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

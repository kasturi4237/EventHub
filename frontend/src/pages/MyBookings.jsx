import { useState, useEffect } from 'react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import QRModal from '../components/QRModal'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Ticket, QrCode, X } from 'lucide-react'

const BANNER_COLORS = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrBooking, setQrBooking] = useState(null)

  useEffect(() => {
    api.get('/bookings/my-bookings')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      setBookings(b => b.filter(booking => booking._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="page-header mb-1">My Tickets</h1>
        <p className="text-gray-400">{bookings.length} active booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-24">
          <Ticket size={48} className="text-violet-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No tickets yet</h3>
          <p className="text-gray-300 text-sm mb-6">Browse upcoming events and book your first ticket</p>
          <a href="/events" className="btn-primary text-sm">Explore Events</a>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {bookings.map(b => {
            const bannerColor = b.event?.bannerColor || BANNER_COLORS[0]
            const isCheckedIn = b.status === 'checked_in'
            const isPast = new Date(b.event?.date) < new Date()
            return (
              <div key={b._id} className="bg-white rounded-2xl shadow-soft border border-violet-50 overflow-hidden">
                {/* Top strip */}
                <div className="h-3" style={{ background: bannerColor }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base truncate">{b.event?.title}</h3>
                      <span className={isCheckedIn ? 'badge-checkedin' : 'badge-confirmed'}>
                        {isCheckedIn ? '✓ Checked In' : '● Confirmed'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar size={13} />
                      {new Date(b.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {b.event?.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin size={13} />
                      {b.event?.venue}, {b.event?.city}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-violet-50 rounded-xl p-2.5 border border-violet-100">
                      <div className="text-xs text-gray-400">Tier</div>
                      <div className="font-bold text-sm text-gray-700 truncate">{b.ticketTierName}</div>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-2.5 border border-violet-100">
                      <div className="text-xs text-gray-400">Count</div>
                      <div className="font-bold text-sm text-gray-700">{b.ticketCount}</div>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-2.5 border border-violet-100">
                      <div className="text-xs text-gray-400">Paid</div>
                      <div className="font-bold text-sm text-violet-600">{b.totalAmount === 0 ? 'FREE' : `₹${b.totalAmount.toLocaleString()}`}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 mb-4 text-center border border-gray-100">
                    <span className="text-xs text-gray-400">Ref: </span>
                    <span className="font-mono text-xs font-bold text-gray-600">{b.bookingReference}</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setQrBooking(b)} className="btn-primary flex-1 text-sm py-2">
                      <QrCode size={15} /> Show QR
                    </button>
                    {!isCheckedIn && !isPast && (
                      <button onClick={() => handleCancel(b._id)} className="btn-danger text-sm py-2 px-3">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {qrBooking && <QRModal booking={qrBooking} onClose={() => setQrBooking(null)} />}
    </div>
  )
}

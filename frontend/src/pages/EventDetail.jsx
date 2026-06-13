import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Clock, User, Tag, Users, Minus, Plus, ArrowLeft } from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(null)
  const [qty, setQty] = useState(1)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => { setEvent(data); setSelectedTier(data.ticketTiers?.[0]?.name || null) })
      .catch(() => navigate('/events'))
      .finally(() => setLoading(false))
  }, [id])

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleBook = async () => {
    if (!user) return navigate('/login')
    if (user.role !== 'attendee') return toast.error('Only attendees can book tickets')
    setBooking(true)

    try {
      // Free tickets — skip payment
      if (tier?.price === 0) {
        await api.post('/bookings', { eventId: id, ticketTierName: selectedTier, ticketCount: qty })
        toast.success('Booking confirmed! Check your tickets.')
        navigate('/my-bookings')
        return
      }

      // Paid tickets — Razorpay flow
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your internet.')
        return
      }

      const { data: order } = await api.post('/payments/create-order', {
        eventId: id, ticketTierName: selectedTier, ticketCount: qty
      })

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'EventHub',
        description: `${order.tierName} × ${order.ticketCount} — ${event.title}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id, ticketTierName: selectedTier, ticketCount: qty
            })
            toast.success('Payment successful! Booking confirmed.')
            navigate('/my-bookings')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed')
            setBooking(false)
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#7C3AED' },
        modal: { ondismiss: () => setBooking(false) }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
      setBooking(false)
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  if (!event) return null

  const tier = event.ticketTiers?.find(t => t.name === selectedTier)
  const available = tier ? tier.capacity - tier.sold : 0
  const totalCost = tier ? tier.price * qty : 0
  const isPast = new Date(event.date) < new Date()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 text-sm text-gray-400">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Event info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner */}
          <div className="h-52 rounded-2xl flex items-end p-6" style={{ background: `linear-gradient(135deg, ${event.bannerColor || '#7C3AED'}, ${event.bannerColor || '#7C3AED'}88)` }}>
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize mb-3 backdrop-blur-sm">
                {event.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{event.title}</h1>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Event Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-violet-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Date</div>
                  <div className="font-semibold text-gray-700">
                    {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-violet-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Time</div>
                  <div className="font-semibold text-gray-700">{event.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-violet-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Venue</div>
                  <div className="font-semibold text-gray-700">{event.venue}, {event.city}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <User size={16} className="text-violet-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Organizer</div>
                  <div className="font-semibold text-gray-700">{event.organizer?.name}</div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 mb-2">About this event</h3>
            <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Ticket tiers */}
          <div className="card">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Tag size={18} className="text-violet-500" /> Available Tickets
            </h2>
            <div className="space-y-3">
              {event.ticketTiers?.map(t => {
                const rem = t.capacity - t.sold
                const pct = (t.sold / t.capacity) * 100
                return (
                  <button key={t.name} onClick={() => { setSelectedTier(t.name); setQty(1) }}
                    disabled={rem === 0}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTier === t.name ? 'border-violet-400 bg-violet-50' : rem === 0 ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-violet-100 hover:border-violet-300 bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-gray-800">{t.name}</span>
                        {rem <= 5 && rem > 0 && <span className="ml-2 text-xs text-orange-500 font-semibold">Only {rem} left!</span>}
                        {rem === 0 && <span className="ml-2 text-xs text-red-500 font-semibold">Sold out</span>}
                      </div>
                      <span className="font-bold text-violet-700">{t.price === 0 ? 'FREE' : `₹${t.price.toLocaleString()}`}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-violet-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{rem} of {t.capacity} remaining</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right - Booking card */}
        <div className="lg:col-span-1">
          <div className="card shadow-card sticky top-24">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Book Tickets</h3>

            {isPast ? (
              <div className="text-center py-6 text-gray-400">
                <Calendar size={36} className="mx-auto mb-2 text-gray-200" />
                <p className="font-medium">This event has passed</p>
              </div>
            ) : event.status !== 'published' ? (
              <div className="text-center py-6 text-gray-400">
                <p className="font-medium">Event not available</p>
              </div>
            ) : !selectedTier ? (
              <p className="text-gray-400 text-sm">No tickets available</p>
            ) : (
              <>
                <div className="bg-violet-50 rounded-xl p-4 mb-5 border border-violet-100">
                  <div className="text-sm text-gray-500 mb-1">Selected tier</div>
                  <div className="font-bold text-gray-800">{selectedTier}</div>
                  <div className="text-violet-600 font-semibold mt-1">{tier?.price === 0 ? 'FREE' : `₹${tier?.price?.toLocaleString()} per ticket`}</div>
                </div>

                <div className="mb-5">
                  <label className="label">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border-2 border-violet-200 flex items-center justify-center hover:bg-violet-50 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-xl font-bold text-gray-800 w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(available, q + 1))} disabled={qty >= available} className="w-9 h-9 rounded-xl border-2 border-violet-200 flex items-center justify-center hover:bg-violet-50 transition-colors disabled:opacity-40">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-violet-50 pt-4 mb-5">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Subtotal ({qty} ticket{qty > 1 ? 's' : ''})</span>
                    <span>{totalCost === 0 ? 'FREE' : `₹${totalCost.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-violet-600">{totalCost === 0 ? 'FREE' : `₹${totalCost.toLocaleString()}`}</span>
                  </div>
                </div>

                {user?.role === 'attendee' ? (
                  <button onClick={handleBook} disabled={booking || available === 0} className="btn-primary w-full">
                    {booking ? 'Processing…' : available === 0 ? 'Sold Out' : totalCost === 0 ? 'Book Free Ticket' : `Pay ₹${totalCost.toLocaleString()}`}
                  </button>
                ) : user ? (
                  <p className="text-center text-sm text-gray-400">Only attendees can book tickets.</p>
                ) : (
                  <Link to="/login" className="btn-primary w-full text-center block">Sign in to Book</Link>
                )}

                <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                  <Users size={11} /> {available} spots remaining
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

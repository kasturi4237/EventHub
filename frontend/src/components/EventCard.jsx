import { Link } from 'react-router-dom'
import { Calendar, MapPin, Tag, Users } from 'lucide-react'

const CATEGORY_COLORS = {
  conference: 'bg-blue-100 text-blue-700',
  workshop: 'bg-amber-100 text-amber-700',
  concert: 'bg-pink-100 text-pink-700',
  sports: 'bg-green-100 text-green-700',
  networking: 'bg-violet-100 text-violet-700',
  other: 'bg-gray-100 text-gray-600'
}

export default function EventCard({ event }) {
  const totalCapacity = event.ticketTiers?.reduce((s, t) => s + t.capacity, 0) || 0
  const totalSold = event.ticketTiers?.reduce((s, t) => s + t.sold, 0) || 0
  const minPrice = event.ticketTiers?.length ? Math.min(...event.ticketTiers.map(t => t.price)) : 0
  const dateObj = new Date(event.date)
  const isFull = totalSold >= totalCapacity && totalCapacity > 0

  return (
    <Link to={`/events/${event._id}`} className="group block bg-white rounded-2xl shadow-soft border border-violet-50 overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300">
      {/* Color banner */}
      <div className="h-32 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${event.bannerColor || '#7C3AED'}, ${event.bannerColor || '#7C3AED'}99)` }}>
        <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other} bg-white/90`}>
          {event.category}
        </span>
        {isFull && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD OUT</span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-violet-700 transition-colors">{event.title}</h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar size={13} className="text-violet-400 shrink-0" />
            {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.time}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin size={13} className="text-violet-400 shrink-0" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>
          {totalCapacity > 0 && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Users size={13} className="text-violet-400 shrink-0" />
              {totalCapacity - totalSold} spots left
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-violet-50">
          <div>
            {minPrice === 0 ? (
              <span className="text-emerald-600 font-bold text-sm">FREE</span>
            ) : (
              <span className="text-violet-700 font-bold text-sm">₹{minPrice.toLocaleString()} <span className="text-gray-400 font-normal">onwards</span></span>
            )}
          </div>
          <span className="text-violet-600 text-xs font-semibold group-hover:underline">View Details →</span>
        </div>
      </div>
    </Link>
  )
}

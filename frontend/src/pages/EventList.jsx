import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const CATEGORIES = ['all', 'conference', 'workshop', 'concert', 'sports', 'networking', 'other']

export default function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [city, setCity] = useState(searchParams.get('city') || '')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 12 })
      if (search) params.set('search', search)
      if (category && category !== 'all') params.set('category', category)
      if (city) params.set('city', city)
      const { data } = await api.get(`/events?${params}`)
      setEvents(data.events)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, category, city])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchEvents()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-header mb-1">Discover Events</h1>
        <p className="text-gray-400">{total} event{total !== 1 ? 's' : ''} available</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-violet-50 p-5 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search events or venues…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10" />
          </div>
          <input type="text" placeholder="City" value={city}
            onChange={e => setCity(e.target.value)}
            className="input md:w-40" />
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
            className="input md:w-44">
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary shrink-0">
            <Filter size={15} /> Search
          </button>
        </form>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1) }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${category === c ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'}`}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24"><LoadingSpinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <Calendar size={48} className="text-violet-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No events found</h3>
          <p className="text-gray-300 mt-1 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {events.map(event => <EventCard key={event._id} event={event} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page === p ? 'bg-violet-600 text-white' : 'bg-white border border-violet-100 text-gray-600 hover:border-violet-300'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages}
                className="btn-secondary py-2 px-3 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

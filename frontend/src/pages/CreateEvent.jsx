import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Trash2, ArrowLeft, Calendar } from 'lucide-react'

const CATEGORIES = ['conference', 'workshop', 'concert', 'sports', 'networking', 'other']
const COLORS = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']

const defaultTier = () => ({ name: '', price: 0, capacity: 100 })

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '', venue: '', city: '',
    category: 'conference', bannerColor: '#7C3AED', status: 'published'
  })
  const [tiers, setTiers] = useState([{ name: 'General', price: 0, capacity: 100 }])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const addTier = () => setTiers(t => [...t, defaultTier()])
  const removeTier = (i) => setTiers(t => t.filter((_, idx) => idx !== i))
  const updateTier = (i, field, value) => setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, [field]: value } : tier))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (tiers.length === 0) return toast.error('Add at least one ticket tier')
    if (tiers.some(t => !t.name.trim())) return toast.error('All ticket tiers need a name')
    const dt = new Date(form.date)
    if (dt < new Date()) return toast.error('Event date must be in the future')

    setLoading(true)
    try {
      const { data } = await api.post('/events', { ...form, ticketTiers: tiers })
      toast.success('Event created successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm text-gray-400 mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="page-header">Create New Event</h1>
        <p className="text-gray-400 mt-1">Fill in the details below to publish your event</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic details */}
        <div className="card">
          <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Calendar size={18} className="text-violet-500" /> Event Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Event Title *</label>
              <input type="text" className="input" placeholder="e.g. React India Conference 2026" value={form.title}
                onChange={e => update('title', e.target.value)} required />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea className="input min-h-[100px] resize-none" placeholder="Describe what attendees can expect…" value={form.description}
                onChange={e => update('description', e.target.value)} required rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => update('date', e.target.value)} required />
              </div>
              <div>
                <label className="label">Time *</label>
                <input type="time" className="input" value={form.time}
                  onChange={e => update('time', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Venue *</label>
                <input type="text" className="input" placeholder="e.g. NIMHANS Convention Centre" value={form.venue}
                  onChange={e => update('venue', e.target.value)} required />
              </div>
              <div>
                <label className="label">City *</label>
                <input type="text" className="input" placeholder="e.g. Bangalore" value={form.city}
                  onChange={e => update('city', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={e => update('status', e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Banner color picker */}
            <div>
              <label className="label">Banner Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => update('bannerColor', c)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${form.bannerColor === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="mt-2 h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.bannerColor}, ${form.bannerColor}88)` }} />
            </div>
          </div>
        </div>

        {/* Ticket tiers */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-lg">Ticket Tiers</h2>
            <button type="button" onClick={addTier} className="btn-secondary text-sm py-2 px-3">
              <Plus size={14} /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <div key={i} className="bg-violet-50 rounded-xl p-4 border border-violet-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-violet-700">Tier {i + 1}</span>
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label text-xs">Name *</label>
                    <input type="text" className="input text-sm" placeholder="e.g. General" value={tier.name}
                      onChange={e => updateTier(i, 'name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">Price (₹)</label>
                    <input type="number" className="input text-sm" placeholder="0 for free" min="0" value={tier.price}
                      onChange={e => updateTier(i, 'price', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label text-xs">Capacity</label>
                    <input type="number" className="input text-sm" placeholder="100" min="1" value={tier.capacity}
                      onChange={e => updateTier(i, 'capacity', parseInt(e.target.value) || 1)} required />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 py-3" disabled={loading}>
            {loading ? 'Creating Event…' : 'Publish Event'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Trash2, ArrowLeft, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['conference', 'workshop', 'concert', 'sports', 'networking', 'other']
const COLORS = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => {
        setForm({
          title: data.title, description: data.description,
          date: data.date?.split('T')[0] || '', time: data.time,
          venue: data.venue, city: data.city, category: data.category,
          bannerColor: data.bannerColor || '#7C3AED', status: data.status
        })
        setTiers(data.ticketTiers || [])
      })
      .catch(() => { toast.error('Event not found'); navigate('/dashboard') })
      .finally(() => setPageLoading(false))
  }, [id])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const addTier = () => setTiers(t => [...t, { name: '', price: 0, capacity: 100, sold: 0 }])
  const removeTier = (i) => setTiers(t => t.filter((_, idx) => idx !== i))
  const updateTier = (i, field, value) => setTiers(t => t.map((tier, idx) => idx === i ? { ...tier, [field]: value } : tier))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (tiers.length === 0) return toast.error('Add at least one ticket tier')
    if (tiers.some(t => !t.name.trim())) return toast.error('All ticket tiers need a name')
    setSaving(true)
    try {
      await api.put(`/events/${id}`, { ...form, ticketTiers: tiers })
      toast.success('Event updated!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm text-gray-400 mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="page-header">Edit Event</h1>
        <p className="text-gray-400 mt-1">Update event details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
            <Calendar size={18} className="text-violet-500" /> Event Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Event Title *</label>
              <input type="text" className="input" value={form.title}
                onChange={e => update('title', e.target.value)} required />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea className="input resize-none" rows={4} value={form.description}
                onChange={e => update('description', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" value={form.date}
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
                <input type="text" className="input" value={form.venue}
                  onChange={e => update('venue', e.target.value)} required />
              </div>
              <div>
                <label className="label">City *</label>
                <input type="text" className="input" value={form.city}
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
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Banner Color</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => update('bannerColor', c)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${form.bannerColor === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <div className="h-12 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.bannerColor}, ${form.bannerColor}88)` }} />
            </div>
          </div>
        </div>

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
                    <input type="text" className="input text-sm" value={tier.name}
                      onChange={e => updateTier(i, 'name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label text-xs">Price (₹)</label>
                    <input type="number" className="input text-sm" min="0" value={tier.price}
                      onChange={e => updateTier(i, 'price', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label text-xs">Capacity</label>
                    <input type="number" className="input text-sm" min="1" value={tier.capacity}
                      onChange={e => updateTier(i, 'capacity', parseInt(e.target.value) || 1)} required />
                  </div>
                </div>
                {tier.sold > 0 && (
                  <p className="text-xs text-amber-600 mt-2">⚠ {tier.sold} tickets already sold for this tier</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 py-3" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

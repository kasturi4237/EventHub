import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Eye, EyeOff, Building2, User, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'attendee', label: 'Attendee', desc: 'Browse and book event tickets', icon: User, color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { value: 'organizer', label: 'Organizer', desc: 'Create and manage events', icon: Building2, color: 'border-violet-300 bg-violet-50 text-violet-700' },
  { value: 'staff', label: 'Staff', desc: 'Scan tickets and check in guests', icon: Users, color: 'border-blue-300 bg-blue-50 text-blue-700' },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.role)
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`)
      const dest = user.role === 'organizer' ? '/dashboard' : user.role === 'staff' ? '/checkin' : '/events'
      navigate(dest)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Calendar size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create your account</h1>
          <p className="text-gray-400 mt-1">Free forever · No credit card needed</p>
        </div>

        <div className="card shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="label">I want to…</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${form.role === r.value ? r.color + ' border-2' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-violet-200'}`}>
                    <r.icon size={18} className="mx-auto mb-1" />
                    <div className="text-xs font-semibold">{r.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{ROLES.find(r => r.value === form.role)?.desc}</p>
            </div>

            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="Priya Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

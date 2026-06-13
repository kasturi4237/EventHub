import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    const dest = user.role === 'organizer' ? '/dashboard' : user.role === 'staff' ? '/checkin' : '/events'
    navigate(dest, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loggedIn = await login(form.email, form.password)
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`)
      const dest = loggedIn.role === 'organizer' ? '/dashboard' : loggedIn.role === 'staff' ? '/checkin' : '/events'
      navigate(dest)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
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
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your EventHub account</p>
        </div>

        <div className="card shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11" placeholder="••••••••" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>

        <div className="mt-6 bg-violet-50 rounded-2xl border border-violet-100 p-4">
          <p className="text-xs text-gray-400 text-center font-medium mb-3">Demo accounts</p>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between"><span>Organizer:</span><span className="font-mono">organizer@demo.com / demo123</span></div>
            <div className="flex justify-between"><span>Attendee:</span><span className="font-mono">attendee@demo.com / demo123</span></div>
            <div className="flex justify-between"><span>Staff:</span><span className="font-mono">staff@demo.com / demo123</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Calendar, QrCode, Ticket, Star, ArrowRight, Zap, Shield, Globe } from 'lucide-react'

const features = [
  { icon: Calendar, title: 'Create Events', desc: 'Set up events with multiple ticket tiers, capacity management, and rich details in minutes.', color: 'bg-violet-100 text-violet-700' },
  { icon: Ticket, title: 'Book Tickets', desc: 'Browse events, choose your tier, and get instant booking confirmation with QR code.', color: 'bg-emerald-100 text-emerald-700' },
  { icon: QrCode, title: 'QR Check-in', desc: 'Staff scan tickets at the door using the built-in camera scanner. No special hardware needed.', color: 'bg-blue-100 text-blue-700' },
]

const stats = [
  { label: 'Events Created', value: '500+' },
  { label: 'Tickets Booked', value: '12K+' },
  { label: 'Check-ins Done', value: '10K+' },
  { label: 'Happy Organizers', value: '200+' },
]

const categories = ['Conference', 'Workshop', 'Concert', 'Sports', 'Networking']

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={14} />
            Free · No credit card required · Ready to deploy
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Events, Tickets &<br />
            <span className="text-violet-200">QR Check-in</span>
          </h1>
          <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform to create events, sell tickets, and check in attendees using QR codes. For organizers who want things to just work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-all shadow-lg flex items-center gap-2 text-base">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/events" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all text-base">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-violet-50 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-violet-700">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-gray-400 text-lg">Three roles, one platform — organizers, attendees, and staff all covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="card hover:shadow-card transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Discover by Category</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(c => (
              <Link key={c} to={`/events?category=${c.toLowerCase()}`}
                className="bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold px-6 py-2.5 rounded-full border border-violet-100 transition-all text-sm">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Globe, title: 'Organizer creates event', desc: 'Set up event details, ticket tiers, capacity, and pricing.' },
              { step: '02', icon: Ticket, title: 'Attendees book tickets', desc: 'Browse events, choose tier, and receive QR code instantly.' },
              { step: '03', icon: QrCode, title: 'Staff scans at door', desc: 'Open the Check-in page, point camera, get instant confirmation.' },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="card">
                  <div className="text-4xl font-black text-violet-100 mb-4">{item.step}</div>
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-violet-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Shield size={40} className="text-white/60 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-white mb-4">Start managing events today</h2>
          <p className="text-violet-100 mb-8">Free to use. No hidden fees. Deploy on your own infrastructure.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl hover:bg-violet-50 transition-all shadow-lg">
              Create Your Account
            </Link>
            <Link to="/events" className="border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all">
              Explore Events
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-violet-50 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-violet-700 font-bold text-lg mb-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Calendar size={15} className="text-white" />
          </div>
          EventHub
        </div>
        <p className="text-gray-400 text-sm">Open-source · Self-hosted · Free forever</p>
      </footer>
    </div>
  )
}

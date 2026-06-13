import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import api from '../api/axios'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { QrCode, CheckCircle, XCircle, Clock, Search, Users, Hash } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CheckIn() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [manualToken, setManualToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [eventId, setEventId] = useState('')
  const [events, setEvents] = useState([])
  const [recentCheckins, setRecentCheckins] = useState([])
  const scannerRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    api.get('/events?limit=50').then(({ data }) => setEvents(data.events || []))
  }, [])

  useEffect(() => {
    if (!eventId) return
    loadStats()
    socketRef.current = io('', { path: '/socket.io' })
    socketRef.current.emit('join-event', eventId)
    socketRef.current.on('checkin', (data) => {
      setRecentCheckins(prev => [{ ...data, id: Date.now() }, ...prev].slice(0, 10))
      setStats(prev => prev ? { ...prev, checkedIn: prev.checkedIn + 1, remaining: prev.remaining - 1 } : prev)
    })
    return () => { socketRef.current?.disconnect() }
  }, [eventId])

  const loadStats = async () => {
    try {
      const { data } = await api.get(`/checkin/stats/${eventId}`)
      setStats(data)
      setRecentCheckins(data.recent || [])
    } catch {}
  }

  const startScanner = () => {
    setScanning(true)
    setResult(null)
    setTimeout(() => {
      if (scannerRef.current) return
      const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true }, false)
      scanner.render(
        async (token) => {
          scanner.clear().catch(() => {})
          scannerRef.current = null
          setScanning(false)
          await processToken(token)
        },
        () => {}
      )
      scannerRef.current = scanner
    }, 100)
  }

  const stopScanner = () => {
    scannerRef.current?.clear().catch(() => {})
    scannerRef.current = null
    setScanning(false)
  }

  const processToken = async (token) => {
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/checkin/scan', { qrToken: token.trim() })
      setResult({ success: true, data })
      toast.success(`✓ ${data.booking.attendeeName} checked in!`)
      if (eventId) loadStats()
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed'
      setResult({ success: false, message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleManual = (e) => {
    e.preventDefault()
    if (!manualToken.trim()) return
    processToken(manualToken.trim())
    setManualToken('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="page-header mb-1 flex items-center gap-2">
          <QrCode className="text-violet-600" size={26} /> QR Check-in
        </h1>
        <p className="text-gray-400">Scan attendee tickets to check them in</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Scanner */}
        <div className="lg:col-span-2 space-y-5">
          {/* Event selector */}
          <div className="card">
            <label className="label">Event (for live stats)</label>
            <select value={eventId} onChange={e => setEventId(e.target.value)} className="input">
              <option value="">-- Select an event (optional) --</option>
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} — {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </option>
              ))}
            </select>
          </div>

          {/* Camera scanner */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <QrCode size={18} className="text-violet-500" /> Camera Scanner
            </h2>

            {!scanning ? (
              <button onClick={startScanner} className="btn-primary w-full py-3 text-base">
                <QrCode size={18} /> Start Camera Scanner
              </button>
            ) : (
              <>
                <div id="qr-reader" className="rounded-xl overflow-hidden mb-3" />
                <button onClick={stopScanner} className="btn-secondary w-full text-sm">Stop Scanner</button>
              </>
            )}
          </div>

          {/* Manual entry */}
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Hash size={18} className="text-violet-500" /> Manual Token Entry
            </h2>
            <form onSubmit={handleManual} className="flex gap-3">
              <input type="text" className="input flex-1" placeholder="Paste QR token or booking reference…"
                value={manualToken} onChange={e => setManualToken(e.target.value)} />
              <button type="submit" className="btn-primary shrink-0" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : <Search size={16} />}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`card border-2 ${result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-4">
                {result.success ? (
                  <CheckCircle size={32} className="text-emerald-500 shrink-0 mt-1" />
                ) : (
                  <XCircle size={32} className="text-red-400 shrink-0 mt-1" />
                )}
                <div>
                  <div className={`font-bold text-lg ${result.success ? 'text-emerald-700' : 'text-red-600'}`}>
                    {result.success ? 'Check-in Successful!' : 'Check-in Failed'}
                  </div>
                  {result.success ? (
                    <div className="mt-2 space-y-1 text-sm text-emerald-600">
                      <div><span className="font-semibold">Attendee:</span> {result.data.booking.attendeeName}</div>
                      <div><span className="font-semibold">Email:</span> {result.data.booking.attendeeEmail}</div>
                      <div><span className="font-semibold">Ticket:</span> {result.data.booking.ticketTier} × {result.data.booking.ticketCount}</div>
                      <div><span className="font-semibold">Event:</span> {result.data.booking.eventTitle}</div>
                      <div><span className="font-semibold">Ref:</span> <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{result.data.booking.reference}</code></div>
                    </div>
                  ) : (
                    <p className="text-red-500 mt-1 text-sm">{result.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right - Stats & recent */}
        <div className="space-y-5">
          {/* Live stats */}
          {stats && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={16} className="text-violet-500" /> Live Stats
              </h3>
              <p className="text-sm text-gray-500 mb-4 font-medium truncate">{stats.event?.title}</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-violet-50">
                  <span className="text-sm text-gray-500">Total Tickets</span>
                  <span className="font-bold text-gray-800">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-violet-50">
                  <span className="text-sm text-gray-500">Checked In</span>
                  <span className="font-bold text-emerald-600">{stats.checkedIn}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Remaining</span>
                  <span className="font-bold text-violet-600">{stats.remaining}</span>
                </div>
              </div>
              {stats.total > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stats.checkedIn / stats.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-violet-100 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(stats.checkedIn / stats.total) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent check-ins */}
          {recentCheckins.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-violet-500" /> Recent Check-ins
              </h3>
              <div className="space-y-2">
                {recentCheckins.slice(0, 8).map((c, i) => (
                  <div key={c._id || c.id || i} className="flex items-center gap-3 py-2 border-b border-violet-50 last:border-0">
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle size={12} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-700 truncate">{c.attendee?.name || c.attendeeName}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!stats && (
            <div className="card text-center text-gray-400 py-8">
              <QrCode size={36} className="mx-auto mb-3 text-violet-200" />
              <p className="text-sm">Select an event to see live check-in stats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

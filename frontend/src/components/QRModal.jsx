import { X, Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import LoadingSpinner from './LoadingSpinner'

export default function QRModal({ booking, onClose }) {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/bookings/${booking._id}/qr`)
      .then(({ data }) => setQrData(data))
      .finally(() => setLoading(false))
  }, [booking._id])

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${booking.bookingReference}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-card max-w-sm w-full p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Your Ticket</h3>
          <button onClick={onClose} className="p-2 hover:bg-violet-50 rounded-xl transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">{booking.event?.title}</p>
          <p className="text-xs text-gray-400 mb-5">
            {new Date(booking.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="bg-violet-50 rounded-2xl p-6 mb-5 flex justify-center border border-violet-100">
              <QRCodeSVG
                id="qr-code-svg"
                value={booking.qrToken || qrData?.bookingReference || 'invalid'}
                size={180}
                fgColor="#1E1B3A"
                bgColor="transparent"
                level="H"
              />
            </div>
          )}

          <div className="bg-violet-50 rounded-xl p-3 mb-5 border border-violet-100">
            <p className="text-xs text-gray-400 mb-1">Booking Reference</p>
            <p className="font-mono font-bold text-violet-700 tracking-wider">{booking.bookingReference}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Tier</p>
              <p className="font-semibold text-sm text-gray-700 mt-0.5">{booking.ticketTierName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Count</p>
              <p className="font-semibold text-sm text-gray-700 mt-0.5">{booking.ticketCount}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Status</p>
              <p className={`font-semibold text-xs mt-0.5 ${booking.status === 'checked_in' ? 'text-violet-600' : 'text-emerald-600'}`}>
                {booking.status === 'checked_in' ? 'Checked In' : 'Confirmed'}
              </p>
            </div>
          </div>

          <button onClick={downloadQR} className="btn-secondary w-full text-sm">
            <Download size={15} /> Download Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

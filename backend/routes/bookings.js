const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../utils/email');

const router = express.Router();

const genRef = () => 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Attendee — create booking
router.post('/', protect, authorize('attendee'), async (req, res) => {
  try {
    const { eventId, ticketTierName, ticketCount = 1 } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ message: 'Event is not available for booking' });

    const tier = event.ticketTiers.find(t => t.name === ticketTierName);
    if (!tier) return res.status(400).json({ message: 'Ticket tier not found' });

    const available = tier.capacity - tier.sold;
    if (available < ticketCount) return res.status(400).json({ message: `Only ${available} ticket(s) remaining` });

    const existing = await Booking.findOne({ event: eventId, attendee: req.user._id, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'You already have a booking for this event' });

    const qrToken = uuidv4();
    const bookingReference = genRef();
    const totalAmount = tier.price * ticketCount;

    const booking = await Booking.create({
      event: eventId, attendee: req.user._id,
      ticketTierName, ticketCount,
      pricePerTicket: tier.price, totalAmount,
      qrToken, bookingReference
    });

    tier.sold += parseInt(ticketCount);
    await event.save();

    const qrDataUrl = await QRCode.toDataURL(qrToken, { width: 300, margin: 2, color: { dark: '#1E1B3A', light: '#FFFFFF' } });

    sendBookingConfirmation({
      to: req.user.email, name: req.user.name,
      eventTitle: event.title, eventDate: event.date, eventVenue: event.venue,
      bookingReference, qrDataUrl, ticketCount, ticketTier: ticketTierName, totalAmount
    }).catch(() => {});

    const populated = await booking.populate('event', 'title date venue city category bannerColor');
    res.status(201).json({ ...populated.toObject(), qrDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Attendee — my bookings
router.get('/my-bookings', protect, authorize('attendee'), async (req, res) => {
  try {
    const bookings = await Booking.find({ attendee: req.user._id, status: { $ne: 'cancelled' } })
      .populate('event', 'title date venue city category bannerColor time')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get QR code for a booking (owner only)
router.get('/:id/qr', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.attendee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const qrDataUrl = await QRCode.toDataURL(booking.qrToken, { width: 300, margin: 2, color: { dark: '#1E1B3A', light: '#FFFFFF' } });
    res.json({ qrDataUrl, bookingReference: booking.bookingReference, status: booking.status });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Attendee — cancel booking
router.put('/:id/cancel', protect, authorize('attendee'), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, attendee: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'checked_in') return res.status(400).json({ message: 'Cannot cancel after check-in' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    const event = await Event.findById(booking.event);
    if (event) {
      const tier = event.ticketTiers.find(t => t.name === booking.ticketTierName);
      if (tier) tier.sold = Math.max(0, tier.sold - booking.ticketCount);
      await event.save();
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

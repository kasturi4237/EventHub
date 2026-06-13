const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Scan and check in a ticket
router.post('/scan', protect, authorize('staff', 'organizer'), async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken || !qrToken.trim()) return res.status(400).json({ success: false, message: 'QR token is required' });

    const booking = await Booking.findOne({ qrToken: qrToken.trim() })
      .populate('event', 'title date venue')
      .populate('attendee', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Invalid QR code — ticket not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ success: false, message: 'This ticket has been cancelled' });
    if (booking.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in',
        checkedInAt: booking.checkedInAt,
        attendeeName: booking.attendee.name
      });
    }

    booking.status = 'checked_in';
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user._id;
    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`event-${booking.event._id}`).emit('checkin', {
        bookingId: booking._id,
        attendeeName: booking.attendee.name,
        checkedInAt: booking.checkedInAt,
        ticketTier: booking.ticketTierName
      });
    }

    res.json({
      success: true,
      message: 'Check-in successful!',
      booking: {
        reference: booking.bookingReference,
        attendeeName: booking.attendee.name,
        attendeeEmail: booking.attendee.email,
        ticketTier: booking.ticketTierName,
        ticketCount: booking.ticketCount,
        eventTitle: booking.event.title
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get check-in stats for an event
router.get('/stats/:eventId', protect, authorize('staff', 'organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const [total, checkedIn, recent] = await Promise.all([
      Booking.countDocuments({ event: req.params.eventId, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ event: req.params.eventId, status: 'checked_in' }),
      Booking.find({ event: req.params.eventId, status: 'checked_in' })
        .populate('attendee', 'name')
        .sort({ checkedInAt: -1 })
        .limit(10)
    ]);

    res.json({ event: { id: event._id, title: event.title, date: event.date }, total, checkedIn, remaining: total - checkedIn, recent });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

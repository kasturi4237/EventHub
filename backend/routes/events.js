const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public — browse published events
router.get('/', async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;
    const filter = { status: 'published' };
    if (category && category !== 'all') filter.category = category;
    if (city && city.trim()) filter.city = new RegExp(city.trim(), 'i');
    if (search && search.trim()) filter.$or = [
      { title: new RegExp(search.trim(), 'i') },
      { venue: new RegExp(search.trim(), 'i') }
    ];
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('organizer', 'name')
      .sort({ date: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Public — single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Organizer — create event
router.post('/', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(event);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Organizer — update own event
router.put('/:id', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found or not authorized' });
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Organizer — delete own event
router.delete('/:id', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: 'Event not found or not authorized' });
    res.json({ message: 'Event deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Organizer — my events with stats
router.get('/organizer/my-events', protect, authorize('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    const eventsWithStats = await Promise.all(events.map(async (ev) => {
      const [totalBookings, checkedIn, revenue] = await Promise.all([
        Booking.countDocuments({ event: ev._id, status: { $ne: 'cancelled' } }),
        Booking.countDocuments({ event: ev._id, status: 'checked_in' }),
        Booking.aggregate([
          { $match: { event: ev._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);
      return { ...ev.toObject(), totalBookings, checkedIn, revenue: revenue[0]?.total || 0 };
    }));
    res.json(eventsWithStats);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Organizer/Staff — bookings for an event
router.get('/:id/bookings', protect, authorize('organizer', 'staff'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const bookings = await Booking.find({ event: req.params.id })
      .populate('attendee', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;

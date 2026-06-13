const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../utils/email');

const router = express.Router();

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const genRef = () => 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Step 1 — create a Razorpay order
router.post('/create-order', protect, authorize('attendee'), async (req, res) => {
  try {
    const { eventId, ticketTierName, ticketCount = 1 } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ message: 'Event not available' });

    const tier = event.ticketTiers.find(t => t.name === ticketTierName);
    if (!tier) return res.status(400).json({ message: 'Ticket tier not found' });

    const available = tier.capacity - tier.sold;
    if (available < ticketCount) return res.status(400).json({ message: `Only ${available} ticket(s) remaining` });

    const existing = await Booking.findOne({ event: eventId, attendee: req.user._id, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'You already have a booking for this event' });

    const totalAmount = tier.price * ticketCount;

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { eventId: eventId.toString(), ticketTierName, ticketCount: String(ticketCount) }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      eventTitle: event.title,
      tierName: ticketTierName,
      ticketCount,
      totalAmount
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create payment order' });
  }
});

// Step 2 — verify payment signature and create booking
router.post('/verify', protect, authorize('attendee'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, ticketTierName, ticketCount } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const tier = event.ticketTiers.find(t => t.name === ticketTierName);
    if (!tier) return res.status(400).json({ message: 'Ticket tier not found' });

    const qrToken = uuidv4();
    const bookingReference = genRef();
    const totalAmount = tier.price * parseInt(ticketCount);

    const booking = await Booking.create({
      event: eventId,
      attendee: req.user._id,
      ticketTierName,
      ticketCount: parseInt(ticketCount),
      pricePerTicket: tier.price,
      totalAmount,
      qrToken,
      bookingReference,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id
    });

    tier.sold += parseInt(ticketCount);
    await event.save();

    const qrDataUrl = await QRCode.toDataURL(qrToken, { width: 300, margin: 2, color: { dark: '#1E1B3A', light: '#FFFFFF' } });

    sendBookingConfirmation({
      to: req.user.email, name: req.user.name,
      eventTitle: event.title, eventDate: event.date, eventVenue: event.venue,
      bookingReference, qrDataUrl, ticketCount, ticketTier: ticketTierName, totalAmount
    }).catch(() => {});

    const populated = await booking.populate('event', 'title date venue city category bannerColor time');
    res.status(201).json({ ...populated.toObject(), qrDataUrl });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Booking creation failed after payment' });
  }
});

module.exports = router;

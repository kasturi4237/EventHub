const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketTierName: { type: String, required: true },
  ticketCount: { type: Number, required: true, min: 1, max: 10 },
  pricePerTicket: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  qrToken: { type: String, required: true, unique: true },
  bookingReference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['confirmed', 'checked_in', 'cancelled'], default: 'confirmed' },
  checkedInAt: { type: Date, default: null },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpayOrderId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

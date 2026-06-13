const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1 },
  sold: { type: Number, default: 0 }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  city: { type: String, required: true },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'concert', 'sports', 'networking', 'other'],
    default: 'other'
  },
  bannerColor: { type: String, default: '#7C3AED' },
  ticketTiers: { type: [tierSchema], validate: v => v.length > 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'published' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

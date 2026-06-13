require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventhub');
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Event.deleteMany({});

  const [organizer, attendee, staff] = await User.create([
    { name: 'Event Organizer', email: 'organizer@demo.com', password: 'demo123', role: 'organizer' },
    { name: 'Demo Attendee', email: 'attendee@demo.com', password: 'demo123', role: 'attendee' },
    { name: 'Door Staff', email: 'staff@demo.com', password: 'demo123', role: 'staff' },
  ]);
  console.log('✓ Demo users created');

  const futureDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d;
  };

  await Event.create([
    {
      title: 'React India Conference 2026',
      description: 'The largest React conference in India. Two days of talks, workshops, and networking with the best minds in the React ecosystem. Speakers from top companies including Meta, Vercel, and more.',
      date: futureDate(15), time: '09:00',
      venue: 'NIMHANS Convention Centre', city: 'Bangalore',
      category: 'conference', bannerColor: '#7C3AED',
      ticketTiers: [
        { name: 'General', price: 999, capacity: 500, sold: 120 },
        { name: 'VIP', price: 2499, capacity: 50, sold: 12 },
        { name: 'Workshop Pass', price: 1499, capacity: 100, sold: 45 }
      ],
      organizer: organizer._id, status: 'published'
    },
    {
      title: 'Startup Networking Night',
      description: 'Connect with 200+ founders, investors, and tech professionals in Hyderabad. Structured networking, pitch sessions, and great food. Perfect for early-stage founders and investors looking for deals.',
      date: futureDate(8), time: '18:30',
      venue: 'T-Hub, Raidurgam', city: 'Hyderabad',
      category: 'networking', bannerColor: '#0EA5E9',
      ticketTiers: [
        { name: 'Standard', price: 0, capacity: 150, sold: 67 },
        { name: 'Premium (with dinner)', price: 499, capacity: 30, sold: 10 }
      ],
      organizer: organizer._id, status: 'published'
    },
    {
      title: 'Full Stack Workshop: Node + React',
      description: 'A hands-on 6-hour workshop covering REST API design with Node.js/Express, React with hooks, and deployment to cloud platforms. Bring your laptop. All skill levels welcome.',
      date: futureDate(20), time: '10:00',
      venue: 'WeWork Prestige Central', city: 'Bangalore',
      category: 'workshop', bannerColor: '#10B981',
      ticketTiers: [
        { name: 'Early Bird', price: 599, capacity: 30, sold: 22 },
        { name: 'Regular', price: 799, capacity: 20, sold: 5 }
      ],
      organizer: organizer._id, status: 'published'
    },
    {
      title: 'IPL Watch Party — Finals',
      description: 'Watch the IPL final on a massive 20-foot screen with 300 fellow cricket fans. Food, drinks, and prizes for the best-dressed fan. Doors open 2 hours before the match.',
      date: futureDate(5), time: '17:00',
      venue: 'Hard Rock Cafe', city: 'Mumbai',
      category: 'sports', bannerColor: '#F59E0B',
      ticketTiers: [
        { name: 'General', price: 299, capacity: 200, sold: 150 },
        { name: 'VIP Table (4 seats)', price: 999, capacity: 25, sold: 18 }
      ],
      organizer: organizer._id, status: 'published'
    },
    {
      title: 'Indie Music Festival — Summer Edition',
      description: 'Three stages, 12 indie artists, one unforgettable evening. Food trucks, art installations, and music from sunset to midnight. Free for students with ID.',
      date: futureDate(30), time: '16:00',
      venue: 'Cubbon Park Open Grounds', city: 'Bangalore',
      category: 'concert', bannerColor: '#EC4899',
      ticketTiers: [
        { name: 'General Admission', price: 399, capacity: 1000, sold: 234 },
        { name: 'Student', price: 0, capacity: 200, sold: 45 },
        { name: 'VIP Lounge', price: 1199, capacity: 75, sold: 20 }
      ],
      organizer: organizer._id, status: 'published'
    },
    {
      title: 'AI/ML Meetup — Generative AI Edition',
      description: 'Monthly meetup focused on practical applications of generative AI. Lightning talks, demos, and discussion. This month\'s theme: Building RAG applications and fine-tuning small models.',
      date: futureDate(12), time: '19:00',
      venue: 'Google Office, Whitefield', city: 'Bangalore',
      category: 'conference', bannerColor: '#6366F1',
      ticketTiers: [
        { name: 'General', price: 0, capacity: 100, sold: 78 }
      ],
      organizer: organizer._id, status: 'published'
    }
  ]);
  console.log('✓ Sample events created');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Demo accounts:');
  console.log('  Organizer: organizer@demo.com / demo123');
  console.log('  Attendee:  attendee@demo.com / demo123');
  console.log('  Staff:     staff@demo.com / demo123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

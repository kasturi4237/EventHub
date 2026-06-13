# EventHub — Event Management Platform

A full-stack event management platform with event creation, ticket booking, and QR code check-in. Built with React + Node.js + MongoDB. **Completely free — no paid APIs.**

## Features

| Role | Capabilities |
|------|-------------|
| **Organizer** | Create/edit/delete events, multiple ticket tiers, dashboard with live stats, booking management |
| **Attendee** | Browse events, filter by category/city, book tickets, QR code tickets, booking history |
| **Staff** | Camera QR scanner, manual token entry, real-time check-in stats, live attendee feed |

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS (soft violet theme)
- **Backend:** Node.js + Express + Socket.io
- **Database:** MongoDB (local or Atlas free tier)
- **Auth:** JWT (7-day expiry)
- **QR Codes:** `qrcode` (generate) + `html5-qrcode` (scan via camera)
- **Email:** Nodemailer + Gmail SMTP (optional)
- **Real-time:** Socket.io for live check-in updates

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas free account

### 1. Clone / Navigate to the project

```bash
cd event-management-platform
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
copy .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventhub
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional — for booking confirmation emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Seed demo data:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Organizer | organizer@demo.com | demo123 |
| Attendee | attendee@demo.com | demo123 |
| Staff | staff@demo.com | demo123 |

---

## Email Setup (Optional)

To enable booking confirmation emails:

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a password for "Mail"
4. Set `EMAIL_USER` and `EMAIL_PASS` in backend `.env`

Emails are non-blocking — if not configured, bookings still work normally.

---

## Deployment

### Backend (Railway / Render / Fly.io — all free tier)

1. Create a free account on Railway or Render
2. Connect your GitHub repo
3. Set environment variables (same as `.env`)
4. Set start command: `node server.js`
5. Get your backend URL (e.g. `https://eventhub-api.railway.app`)

### Frontend (Vercel / Netlify — free tier)

1. Update `vite.config.js` proxy target to your backend URL for local dev
2. For production, set `VITE_API_URL` env var in Vercel/Netlify
3. Update `frontend/src/api/axios.js` baseURL: `process.env.VITE_API_URL || '/api'`
4. Deploy frontend folder

### MongoDB Atlas (free 512MB)

1. Create account at mongodb.com/atlas
2. Create free M0 cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/eventhub`
4. Set as `MONGO_URI` in backend env vars

---

## API Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user

GET    /api/events                 List published events (public)
GET    /api/events/:id             Get event details (public)
POST   /api/events                 Create event (organizer)
PUT    /api/events/:id             Update event (organizer)
DELETE /api/events/:id             Delete event (organizer)
GET    /api/events/organizer/my-events  Organizer's events with stats
GET    /api/events/:id/bookings    Bookings for an event (organizer/staff)

POST   /api/bookings               Create booking (attendee)
GET    /api/bookings/my-bookings   My bookings (attendee)
GET    /api/bookings/:id/qr        Get QR code for booking
PUT    /api/bookings/:id/cancel    Cancel booking (attendee)

POST   /api/checkin/scan           Scan and check in (staff/organizer)
GET    /api/checkin/stats/:eventId Check-in stats for event
```

---

## Project Structure

```
event-management-platform/
├── backend/
│   ├── models/          User, Event, Booking
│   ├── routes/          auth, events, bookings, checkin
│   ├── middleware/       auth.js (JWT + role guard)
│   ├── utils/            email.js (Nodemailer)
│   ├── server.js         Express + Socket.io entry
│   ├── seed.js           Demo data seeder
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/        Landing, EventList, EventDetail, OrganizerDashboard,
        │                 CreateEvent, EditEvent, MyBookings, CheckIn, Login, Register
        ├── components/   Navbar, EventCard, QRModal, LoadingSpinner, ProtectedRoute
        ├── context/      AuthContext (JWT state)
        └── api/          axios.js (interceptors)
```

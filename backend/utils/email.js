const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendBookingConfirmation = async ({ to, name, eventTitle, eventDate, eventVenue, bookingReference, qrDataUrl, ticketCount, ticketTier, totalAmount }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const dateStr = new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const amountStr = totalAmount === 0 ? 'FREE' : `₹${totalAmount.toLocaleString()}`;

  await getTransporter().sendMail({
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmed ✓ — ${eventTitle}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5F3FF;padding:24px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#7C3AED,#A78BFA);padding:32px;border-radius:12px;text-align:center;margin-bottom:24px;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">EventHub</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;">Your booking is confirmed!</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:12px;margin-bottom:16px;">
          <h2 style="color:#1E1B3A;margin-top:0;">${eventTitle}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;">Date</td><td style="padding:8px 0;font-weight:600;">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;">Venue</td><td style="padding:8px 0;font-weight:600;">${eventVenue}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;">Ticket Type</td><td style="padding:8px 0;font-weight:600;">${ticketTier}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;">Quantity</td><td style="padding:8px 0;font-weight:600;">${ticketCount}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;">Total</td><td style="padding:8px 0;font-weight:600;color:#7C3AED;">${amountStr}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;">Reference</td><td style="padding:8px 0;"><code style="background:#EDE9FE;color:#5B21B6;padding:4px 8px;border-radius:6px;">${bookingReference}</code></td></tr>
          </table>
        </div>
        <div style="background:#fff;padding:24px;border-radius:12px;text-align:center;">
          <p style="color:#6B7280;margin-bottom:16px;">Show this QR code at the venue entrance</p>
          <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px;border:4px solid #EDE9FE;border-radius:12px;" />
        </div>
        <p style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:20px;">EventHub — automated confirmation email</p>
      </div>`
  });
};

module.exports = { sendBookingConfirmation };

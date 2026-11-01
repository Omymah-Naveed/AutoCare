const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function sendPasswordResetEmail({ email, name, resetUrl }) {
  return transporter.sendMail({
    from: `"AutoCare Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your AutoCare password',
    text: `Hi ${name}, reset your AutoCare password here: ${resetUrl}. This link expires in 1 hour.`,
    html: `
      <div style="margin:0;background:#0b0f19;padding:40px 16px;font-family:Arial,sans-serif;color:#f5f7fb">
        <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #273449;border-radius:18px;overflow:hidden">
          <div style="padding:28px 32px;border-bottom:1px solid #273449">
            <div style="font-size:22px;font-weight:800;letter-spacing:-.04em">Auto<span style="color:#ff4153">Care</span></div>
            <div style="margin-top:5px;color:#94a3b8;font-size:11px;letter-spacing:.12em;text-transform:uppercase">Smart Service, Smoother Drives.</div>
          </div>
          <div style="padding:32px">
            <div style="color:#ff4153;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Account security</div>
            <h1 style="margin:12px 0;color:#f5f7fb;font-size:28px">Reset your password</h1>
            <p style="color:#cbd5e1;line-height:1.7">Hi ${name}, we received a request to reset your AutoCare password. Use the button below to choose a new one.</p>
            <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:13px 20px;border-radius:9px;background:#e11d2e;color:#fff;text-decoration:none;font-weight:700">Reset password</a>
            <p style="color:#94a3b8;font-size:13px;line-height:1.6">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
          </div>
          <div style="padding:18px 32px;background:#0d1320;color:#64748b;font-size:11px">AutoCare Studio · Gulberg III, Lahore</div>
        </div>
      </div>
    `,
  })
}

function sendBookingNotificationEmail({ email, name, bookingId, message }) {
  return transporter.sendMail({
    from: `"AutoCare Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `AutoCare booking update · #${bookingId}`,
    text: `Hi ${name}, ${message} Your booking reference is #${bookingId}.`,
    html: `<div style="margin:0;background:#0b0f19;padding:36px 16px;font-family:Arial,sans-serif;color:#f5f7fb"><div style="max-width:540px;margin:auto;background:#111827;border:1px solid #273449;border-radius:16px;padding:30px"><div style="font-size:22px;font-weight:800">Auto<span style="color:#ff4153">Care</span></div><p style="color:#cbd5e1;line-height:1.7">Hi ${name},</p><p style="color:#cbd5e1;line-height:1.7">${message}</p><div style="margin:22px 0;padding:14px;border:1px solid #3b475c;border-radius:10px;color:#ff4153;font-weight:700">Booking reference: #${bookingId}</div><p style="color:#64748b;font-size:12px">AutoCare Studio · Gulberg III, Lahore</p></div></div>`,
  })
}

function sendContactEmail({ name, email, phone, subject, message }) {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !recipient) {
    const error = new Error('Contact email delivery is not configured.')
    error.statusCode = 503
    throw error
  }

  return transporter.sendMail({
    from: `"AutoCare Contact" <${process.env.EMAIL_USER}>`,
    to: recipient,
    replyTo: email,
    subject: `Contact form: ${subject.replace(/[\r\n]/g, ' ')}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      '',
      'Message:',
      message,
    ].join('\n'),
  })
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function sendContactReplyEmail({ email, subject, message, customerName }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Contact reply email delivery is not configured.')
    error.statusCode = 503
    throw error
  }

  const safeName = escapeHtml(customerName || 'there')
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>')

  return transporter.sendMail({
    from: `"AutoCare Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: `Hello ${customerName || 'there'},\n\n${message}\n\nWarm regards,\nAutoCare Support Team\nKarachi, Pakistan · support@autocare.com`,
    html: `
      <div style="margin:0;background:#0b0f19;padding:40px 16px;font-family:Arial,sans-serif;color:#f5f7fb">
        <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #273449;border-radius:18px;overflow:hidden">
          <div style="padding:26px 30px;border-bottom:1px solid #273449">
            <div style="font-size:23px;font-weight:800;letter-spacing:-.04em">Auto<span style="color:#ff4153">Care</span></div>
            <div style="margin-top:5px;color:#94a3b8;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase">Smart Service, Smoother Drives.</div>
          </div>
          <div style="padding:30px">
            <div style="color:#ff4153;font-size:10px;font-weight:700;letter-spacing:.13em;text-transform:uppercase">Customer support</div>
            <h1 style="margin:12px 0 18px;color:#f5f7fb;font-size:25px;line-height:1.2">Hello ${safeName},</h1>
            <div style="color:#cbd5e1;font-size:14px;line-height:1.8">${safeMessage}</div>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #273449;color:#cbd5e1;font-size:13px;line-height:1.7">
              <strong style="display:block;color:#f5f7fb">Warm regards,</strong>
              <span style="color:#ff4153;font-weight:700">AutoCare Support Team</span><br>
              Karachi, Pakistan · support@autocare.com
            </div>
          </div>
          <div style="padding:15px 30px;background:#0d1320;color:#64748b;font-size:10px">Thank you for choosing AutoCare.</div>
        </div>
      </div>
    `,
  })
}

module.exports = {
  sendPasswordResetEmail,
  sendBookingNotificationEmail,
  sendContactEmail,
  sendContactReplyEmail,
}

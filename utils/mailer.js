const nodemailer = require("nodemailer");

let transporter = null;

function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

async function sendSubscriberNotice({ email, source }) {
  const to = process.env.ADMIN_EMAIL || "info@economicvision.com";
  if (!mailConfigured()) {
    return { sent: false, reason: "SMTP is not configured" };
  }

  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || `"The Economic Vision" <${process.env.SMTP_USER}>`,
    to,
    replyTo: email,
    subject: `New newsletter subscriber: ${email}`,
    text: `A new reader subscribed to The Economic Vision.\n\nEmail: ${email}\nForm: ${source || "website"}\nTime: ${when} IST\n`,
    html: `<p>A new reader subscribed to The Economic Vision.</p>
<p><strong>Email:</strong> ${escapeHtml(email)}<br>
<strong>Form:</strong> ${escapeHtml(source || "website")}<br>
<strong>Time:</strong> ${escapeHtml(when)} IST</p>`,
  });

  return { sent: true };
}

module.exports = { mailConfigured, sendSubscriberNotice };

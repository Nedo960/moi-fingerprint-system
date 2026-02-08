const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail(to, subject, htmlBody) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"نظام نموذج نسيان البصمة" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<div dir="rtl" style="font-family: Arial; font-size: 14px;">${htmlBody}</div>`
  });
}

module.exports = { sendMail };

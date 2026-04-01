import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('[Mailer] SMTP credentials are not configured in .env.local');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Defaulting to Gmail; adjust if using SendGrid/Mailgun
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"AyushAlert System" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log('[Mailer] Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending email to', to, ':', error);
    return false;
  }
}

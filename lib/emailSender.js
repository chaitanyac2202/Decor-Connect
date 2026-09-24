import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transport for sending emails.
 * Uses Gmail. To use this, you need a Gmail App Password.
 * 
 * How to get a Gmail App Password:
 * 1. Go to your Google Account (myaccount.google.com)
 * 2. Go to Security
 * 3. Enable 2-Step Verification if not already enabled
 * 4. Go to App Passwords (might be under 2-Step Verification settings)
 * 5. Create a new App Password for "Mail" and "Other (Custom name)"
 * 6. Use the 16-character password provided in your .env file
 */
export function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Sends an email with CAN-SPAM compliance footer.
 */
export async function sendEmail({ to, subject, body, seller }) {
  try {
    const transporter = createTransport();
    
    // CAN-SPAM Compliance: Always include a way to opt out and identify the sender
    const footerText = `\n\n---\nThis email was sent by ${seller?.businessName || 'Us'} (${seller?.email}). To opt out of future emails, reply with STOP.`;
    const finalBody = body + footerText;
    
    const mailOptions = {
      from: `"${seller?.businessName || 'DecorConnect Sender'}" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: seller?.email,
      subject,
      text: finalBody,
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

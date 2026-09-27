import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transport for sending emails.
 * Uses Gmail. To use this, you need a Gmail App Password.
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
 * Generates a unique tracking ID for email open tracking.
 */
export function generateTrackingId() {
  return `trk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Builds the tracking pixel HTML img tag.
 */
function getTrackingPixelHtml(trackingId, recipientEmail, baseUrl) {
  const pixelUrl = `${baseUrl}/api/track/open?id=${encodeURIComponent(trackingId)}&email=${encodeURIComponent(recipientEmail)}`;
  return `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
}

/**
 * Converts plain text email body to simple HTML with tracking pixel.
 */
function textToHtml(text, trackingPixel) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${escaped}
  </div>
  ${trackingPixel}
</body>
</html>`;
}

/**
 * Sends an email with CAN-SPAM compliance footer and optional tracking pixel.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body text
 * @param {Object} options.seller - Seller info
 * @param {string} [options.trackingId] - Optional tracking ID for open tracking
 * @param {string} [options.baseUrl] - Base URL for tracking pixel
 */
export async function sendEmail({ to, subject, body, seller, trackingId, baseUrl }) {
  try {
    const transporter = createTransport();
    
    // CAN-SPAM Compliance: Always include a way to opt out and identify the sender
    const footerText = `\n\n---\nThis email was sent by ${seller?.businessName || 'Us'} (${seller?.email}). To opt out of future emails, reply with STOP.`;
    const finalBody = body + footerText;
    
    // Build tracking pixel if tracking is enabled
    let trackingPixel = '';
    if (trackingId && baseUrl) {
      trackingPixel = getTrackingPixelHtml(trackingId, to, baseUrl);
    }

    const htmlBody = textToHtml(finalBody, trackingPixel);

    const mailOptions = {
      from: `"${seller?.businessName || 'DecorConnect Sender'}" <${process.env.GMAIL_USER}>`,
      to,
      replyTo: seller?.email,
      subject,
      text: finalBody, // Plain text fallback
      html: htmlBody,  // HTML with tracking pixel
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true, trackingId: trackingId || null };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message || 'Failed to send email', trackingId: trackingId || null };
  }
}

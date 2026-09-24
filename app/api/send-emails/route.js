import { sendEmail } from '@/lib/emailSender';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const data = JSON.parse(bodyText);
    const { recipients, subject, body, seller } = data;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ error: 'Invalid or empty recipients array' }, { status: 400 });
    }
    if (!subject || !body || !seller) {
      return Response.json({ error: 'Missing required fields (subject, body, seller)' }, { status: 400 });
    }

    // Hard cap: max 40 recipients per batch to avoid spam/rate limits
    if (recipients.length > 40) {
      return Response.json({ error: 'Batch limit exceeded. Max 40 recipients allowed.' }, { status: 400 });
    }

    const results = { sent: 0, failed: 0, errors: [] };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      if (!recipient.email) {
        results.failed++;
        results.errors.push(`Missing email for ${recipient.name || 'Unknown'}`);
        continue;
      }

      // Personalize the body
      const personalizedBody = body.replace(/\[Buyer Name\]/g, recipient.name || 'Valued Partner');

      // CAN-SPAM Note: The footer is appended in the lib function. 
      // Ensure users are aware that unsolicited bulk email has legal requirements.
      
      const res = await sendEmail({
        to: recipient.email,
        subject,
        body: personalizedBody,
        seller
      });

      if (res.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed for ${recipient.email}: ${res.error}`);
      }

      // Delay between emails to respect rate limits (1 second)
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { sendEmail, createTransport, generateTrackingId } from '@/lib/emailSender';

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

    if (recipients.length > 40) {
      return Response.json({ error: 'Batch limit exceeded. Max 40 recipients allowed.' }, { status: 400 });
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = host ? `${protocol}://${host}` : '';

    const results = { sent: 0, failed: 0, errors: [], recipientDetails: [] };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      if (!recipient.email) {
        results.failed++;
        results.errors.push(`Missing email for ${recipient.name || 'Unknown'}`);
        results.recipientDetails.push({
          name: recipient.name || 'Unknown',
          email: 'N/A',
          status: 'failed',
          error: 'Missing email'
        });
        continue;
      }

      const personalizedBody = body.replace(/\[Buyer Name\]/g, recipient.name || 'Valued Partner');
      const trackingId = generateTrackingId();

      const res = await sendEmail({
        to: recipient.email,
        subject,
        body: personalizedBody,
        seller,
        trackingId,
        baseUrl
      });

      if (res.success) {
        results.sent++;
        results.recipientDetails.push({
          name: recipient.name || 'Unknown',
          email: recipient.email,
          status: 'sent',
          trackingId: res.trackingId
        });
      } else {
        results.failed++;
        results.errors.push(`Failed for ${recipient.email}: ${res.error}`);
        results.recipientDetails.push({
          name: recipient.name || 'Unknown',
          email: recipient.email,
          status: 'failed',
          error: res.error,
          trackingId: null
        });
      }

      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (seller?.email) {
      try {
        const transporter = createTransport();
        
        const sentList = results.recipientDetails
          .filter(r => r.status === 'sent')
          .map(r => `  ✅ ${r.name} (${r.email})`)
          .join('\n');
        
        const failedList = results.recipientDetails
          .filter(r => r.status === 'failed')
          .map(r => `  ❌ ${r.name} (${r.email}) — ${r.error || 'Unknown error'}`)
          .join('\n');
        
        const confirmationBody = [
          `Hi ${seller.name || 'Seller'},`,
          '',
          `Your outreach campaign via DecorConnect has been completed.`,
          '',
          `📊 Summary:`,
          `   Emails Sent Successfully: ${results.sent}`,
          `   Emails Failed: ${results.failed}`,
          '',
          results.sent > 0 ? `✅ Successfully Sent To:\n${sentList}` : '',
          results.failed > 0 ? `\n❌ Failed:\n${failedList}` : '',
          '',
          `📧 Subject Used: "${subject}"`,
          '',
          `Note: All emails were sent with your business name "${seller.businessName || 'N/A'}" as the sender. Buyer replies will be directed to this email address (${seller.email}).`,
          '',
          '— DecorConnect Platform'
        ].filter(Boolean).join('\n');

        await transporter.sendMail({
          from: `"DecorConnect" <${process.env.GMAIL_USER}>`,
          to: seller.email,
          subject: `✅ DecorConnect Outreach Report — ${results.sent} email(s) sent`,
          text: confirmationBody,
        });

        results.confirmationSent = true;
      } catch (confirmError) {
        console.error('Failed to send confirmation email to seller:', confirmError);
        results.confirmationSent = false;
      }
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

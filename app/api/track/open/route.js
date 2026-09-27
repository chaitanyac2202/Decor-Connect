export const dynamic = 'force-dynamic';

// In-memory tracking store (persists across requests in dev, resets on cold start in prod)
if (!global.__emailTrackingStore) {
  global.__emailTrackingStore = new Map();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('id');
    const recipientEmail = searchParams.get('email');

    if (trackingId) {
      const store = global.__emailTrackingStore;
      const existing = store.get(trackingId) || { opens: [], firstOpen: null };
      
      const openRecord = {
        timestamp: new Date().toISOString(),
        email: recipientEmail || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      };

      if (!existing.firstOpen) {
        existing.firstOpen = openRecord.timestamp;
      }
      existing.opens.push(openRecord);
      existing.email = recipientEmail || existing.email;
      store.set(trackingId, existing);

      console.log(`📧 Email opened: ${recipientEmail} (tracking: ${trackingId})`);
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new Response(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Tracking error:', error);
    // Always return the pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new Response(pixel, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}

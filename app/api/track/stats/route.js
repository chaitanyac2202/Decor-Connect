export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = global.__emailTrackingStore || new Map();
    
    const stats = {};
    for (const [trackingId, data] of store.entries()) {
      stats[trackingId] = {
        email: data.email || 'unknown',
        totalOpens: data.opens.length,
        firstOpen: data.firstOpen,
        lastOpen: data.opens.length > 0 ? data.opens[data.opens.length - 1].timestamp : null,
      };
    }

    return Response.json({ 
      totalTracked: store.size,
      stats 
    });
  } catch (error) {
    return Response.json({ totalTracked: 0, stats: {} });
  }
}

export async function POST(request) {
  // Accept batch tracking IDs and return their stats
  try {
    const { trackingIds } = await request.json();
    const store = global.__emailTrackingStore || new Map();
    
    const results = {};
    for (const id of (trackingIds || [])) {
      const data = store.get(id);
      if (data) {
        results[id] = {
          email: data.email || 'unknown',
          totalOpens: data.opens.length,
          firstOpen: data.firstOpen,
          opened: true,
        };
      } else {
        results[id] = { opened: false, totalOpens: 0 };
      }
    }

    return Response.json({ results });
  } catch (error) {
    return Response.json({ results: {} });
  }
}

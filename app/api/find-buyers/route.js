// ===========================================
// /api/find-buyers — Buyer Discovery Endpoint
// ===========================================
// Uses OpenStreetMap (Overpass + Nominatim) for business discovery.
// Completely FREE — no API keys required for discovery.
// Email scraping respects robots.txt per CAN-SPAM guidelines.

import { searchTomTom } from '../../../lib/tomtomClient';
import { discoverBuyers } from '../../../lib/buyerDiscovery';
import { scrapeEmail } from '../../../lib/emailScraper';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, location } = body;

    if (!category || !location) {
      return Response.json(
        { error: 'Category and location are required' },
        { status: 400 }
      );
    }

    // Step 1: Try TomTom API first (Commercial data, high quality, free tier)
    let buyers = await searchTomTom(category, location);
    
    // Step 2: Fallback / Augment with free OpenStreetMap APIs
    if (buyers.length < 20) {
      const osmBuyers = await discoverBuyers(category, location);
      buyers = [...buyers, ...osmBuyers];
    }
    
    // Deduplicate by name
    const seenNames = new Set();
    const deduplicated = [];
    for (const item of buyers) {
      const normalizedName = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (normalizedName.length > 0 && !seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        deduplicated.push(item);
      }
    }
    
    // Limit to maximum 15 buyers to prevent the request from timing out in Netlify's 10s window
    buyers = deduplicated.slice(0, 15);

    if (buyers.length === 0) {
      return Response.json({ buyers: [], totalFound: 0 });
    }

    // Step 2: For buyers with websites, try to scrape emails
    // Process all 15 concurrently
    const MAX_CONCURRENT = 15;
    const finalBuyers = [];

    for (let i = 0; i < buyers.length; i += MAX_CONCURRENT) {
      const chunk = buyers.slice(i, i + MAX_CONCURRENT);

      const promises = chunk.map(async (buyer) => {
        let email = buyer.email || null; // Some OSM entries have email in tags

        // If no email from OSM data, try scraping the website
        if (!email && buyer.website) {
          email = await scrapeEmail(buyer.website);
        }

        return {
          ...buyer,
          email: email,
          emailStatus: email ? 'found' : 'not_found'
        };
      });

      const settled = await Promise.allSettled(promises);
      settled.forEach(result => {
        if (result.status === 'fulfilled') {
          finalBuyers.push(result.value);
        }
      });
    }

    const totalFound = finalBuyers.filter(b => b.emailStatus === 'found').length;

    return Response.json({
      buyers: finalBuyers,
      totalFound,
      message: `Found ${finalBuyers.length} businesses, ${totalFound} with emails`
    });
  } catch (error) {
    console.error('Error in find-buyers route:', error);
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ===========================================
// /api/find-buyers — Buyer Discovery Endpoint
// ===========================================
// Uses OpenStreetMap (Overpass + Nominatim) for business discovery.
// Completely FREE — no API keys required for discovery.
// Email scraping respects robots.txt per CAN-SPAM guidelines.

import { searchTomTom } from '../../../lib/tomtomClient';
import { discoverBuyers } from '../../../lib/buyerDiscovery';
import { scrapeEmail } from '../../../lib/emailScraper';
import { searchFoursquare } from '../../../lib/foursquareClient';
import { searchGooglePlaces } from '../../../lib/googlePlacesClient';

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

    // If the user selected 'All', use a broad search term to get maximum results
    const searchQuery = category.toLowerCase() === 'all' ? 'Home Decor, Gift Shop, Retail' : category;

    // Step 1: Run TomTom, OpenStreetMap, Foursquare, and Google Places searches in parallel for maximum results
    const [tomtomBuyers, osmBuyers, fsqBuyers, googleBuyers] = await Promise.all([
      searchTomTom(searchQuery, location),
      discoverBuyers(searchQuery, location),
      searchFoursquare(searchQuery, location),
      searchGooglePlaces(searchQuery, location)
    ]);
    let buyers = [...tomtomBuyers, ...osmBuyers, ...fsqBuyers, ...googleBuyers];
    
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
    buyers = deduplicated;

    if (buyers.length === 0) {
      return Response.json({ buyers: [], totalFound: 0 });
    }

    // Step 2: For buyers with websites, try to scrape emails
    const MAX_CONCURRENT = 500;
    let finalBuyers = [];

    for (let i = 0; i < buyers.length; i += MAX_CONCURRENT) {
      const chunk = buyers.slice(i, i + MAX_CONCURRENT);

      const promises = chunk.map(async (buyer) => {
        let email = buyer.email || null; 

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

    // REMOVED STRICT FILTER: Because 95% of small businesses hide their emails behind contact forms,
    // filtering them out causes 130+ businesses to disappear, leaving 0 results. 
    // We will show ALL businesses found, but push the ones with emails to the very top.
    finalBuyers.sort((a, b) => {
      if (a.emailStatus === 'found' && b.emailStatus !== 'found') return -1;
      if (a.emailStatus !== 'found' && b.emailStatus === 'found') return 1;
      return 0;
    });

    const totalFoundWithEmails = finalBuyers.filter(b => b.emailStatus === 'found').length;

    return Response.json({
      buyers: finalBuyers,
      totalFound: finalBuyers.length,
      message: `Found ${finalBuyers.length} businesses (${totalFoundWithEmails} with public emails)`
    });
  } catch (error) {
    console.error('Error in find-buyers route:', error);
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

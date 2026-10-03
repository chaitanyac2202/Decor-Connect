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

    let searchQueries = [];
    if (Array.isArray(category)) {
      if (category.includes('All 5 Products (Combined Search)')) {
        searchQueries = [
          'Singing bowls', 'Candle holders', 'Crystal candle holders',
          'Decorative glassware and home decor', 'Votive candle holders'
        ];
        // Also add any extra keywords the user added
        category.forEach(c => {
          if (c !== 'All 5 Products (Combined Search)' && c !== 'All' && !searchQueries.includes(c)) {
            searchQueries.push(c);
          }
        });
      } else {
        searchQueries = category.map(c => c.toLowerCase() === 'all' ? 'Home Decor, Gift Shop, Retail' : c);
      }
    } else {
      const isCombined = category === 'All 5 Products (Combined Search)';
      searchQueries = isCombined 
        ? [
            'Singing bowls',
            'Candle holders',
            'Crystal candle holders',
            'Decorative glassware and home decor',
            'Votive candle holders'
          ]
        : [category.toLowerCase() === 'all' ? 'Home Decor, Gift Shop, Retail' : category];
    }

    const { geocodeLocation } = require('../../../lib/buyerDiscovery');
    const coords = await geocodeLocation(location);
    const { lat, lon } = coords || {};

    let buyers = [];

    // Run searches for each query (sequentially to avoid obliterating rate limits, but the API calls inside are parallel)
    for (const query of searchQueries) {
      const [tomtomBuyers, osmBuyers, fsqBuyers, googleBuyers] = await Promise.all([
        searchTomTom(query, location, lat, lon),
        discoverBuyers(query, location), // discoverBuyers handles its own geocoding caching or can be updated, but we'll leave it as is since it already works
        searchFoursquare(query, location),
        searchGooglePlaces(query, location)
      ]);
      
      const combinedForQuery = [...tomtomBuyers, ...osmBuyers, ...fsqBuyers, ...googleBuyers];
      // Tag each buyer with the query that found them
      combinedForQuery.forEach(b => b.matchedProduct = query);
      buyers = buyers.concat(combinedForQuery);
    }
    
    // Deduplicate by name but aggregate matchedProducts
    const seenNames = new Map();
    for (const item of buyers) {
      const normalizedName = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (normalizedName.length > 0) {
        if (!seenNames.has(normalizedName)) {
          // First time seeing this buyer
          item.matchedProducts = [item.matchedProduct];
          seenNames.set(normalizedName, item);
        } else {
          // Already saw this buyer, add the matched product to their list
          const existingBuyer = seenNames.get(normalizedName);
          if (!existingBuyer.matchedProducts.includes(item.matchedProduct)) {
            existingBuyer.matchedProducts.push(item.matchedProduct);
          }
        }
      }
    }
    buyers = Array.from(seenNames.values());

    if (buyers.length === 0) {
      return Response.json({ buyers: [], totalFound: 0 });
    }

    // Step 2: For buyers with websites, try to scrape emails
    // Reduced concurrency from 500 to 10. 500 concurrent connections saturates the network and causes the 2.5s timeout to trigger on every request during a second search.
    const MAX_CONCURRENT = 10;
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

    // Process duplicate emails without deleting the business rows, so the total count remains high for the report
    const seenEmails = new Set();
    const deduplicatedFinal = [];
    for (const buyer of finalBuyers) {
      if (buyer.email && buyer.email !== 'N/A' && buyer.email !== 'No email found') {
        if (!seenEmails.has(buyer.email)) {
          seenEmails.add(buyer.email);
          deduplicatedFinal.push(buyer);
        } else {
          // If we already saw this email, KEEP the business row but remove the duplicate email
          // This prevents sending 10+ identical emails but keeps the business listed for the report
          buyer.email = null;
          buyer.emailStatus = 'not_found';
          deduplicatedFinal.push(buyer);
        }
      } else {
        // If no email, keep it
        deduplicatedFinal.push(buyer);
      }
    }
    finalBuyers = deduplicatedFinal;

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

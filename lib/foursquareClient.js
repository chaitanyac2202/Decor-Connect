// ===========================================
// Foursquare Places API Client
// ===========================================
// FREE tier — no credit card required
//
// How to get your API key:
//   1. Go to https://foursquare.com/developers/signup
//   2. Create a free account
//   3. Create a new project in the developer console
//   4. Your API Key is shown on the project dashboard
//   5. Free tier: 500 regular calls/day — plenty for discovery
//
// Docs: https://docs.foursquare.com/reference/place-search

// Maps DecorConnect product categories to Foursquare category IDs
// Full list: https://docs.foursquare.com/data-products/docs/categories
export const CATEGORY_MAP = {
  'Wall Art': ['19006', '10032'],            // Home Decor Store, Art Gallery
  'Furniture': ['19005', '19006'],            // Furniture Store, Home Decor Store
  'Lighting': ['19006', '17110'],            // Home Decor Store, Hardware Store
  'Rugs': ['19006', '19005'],                // Home Decor Store, Furniture Store
  'Curtains': ['19006', '19005'],            // Home Decor Store, Furniture Store
  'Vases & Decor Pieces': ['19006', '19004'], // Home Decor Store, Garden Center
  'Mirrors': ['19006', '19005'],             // Home Decor Store, Furniture Store
  'Candles': ['19006', '17069'],             // Home Decor Store, Gift Shop
  'Garden Decor': ['19004', '19006'],        // Garden Center, Home Decor Store
  'Other': ['19006', '19005', '19004']       // Home Decor, Furniture, Garden
};

/**
 * Search Foursquare Places API for businesses matching a category near a location.
 *
 * @param {string} category - Product category from the seller form
 * @param {string} location - US city/state string (e.g. "New York, NY")
 * @returns {Promise<Array>} Normalized array of business objects
 */
export async function searchFoursquare(category, location) {
  try {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) {
      console.warn('FOURSQUARE_API_KEY is not set. Foursquare search will return empty.');
      return [];
    }

    const categories = CATEGORY_MAP[category] || CATEGORY_MAP['Other'];

    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.append('near', location);
    url.searchParams.append('categories', categories.join(','));
    url.searchParams.append('limit', '50');
    url.searchParams.append('fields', 'fsq_id,name,location,tel,website,categories,geocodes,rating');
    url.searchParams.append('sort', 'RELEVANCE');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Foursquare API error: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    if (!data.results) return [];

    return data.results.map(place => {
      const loc = place.location || {};
      const addressParts = [];
      if (loc.address) addressParts.push(loc.address);
      if (loc.locality) addressParts.push(loc.locality);
      if (loc.region) addressParts.push(loc.region);
      if (loc.postcode) addressParts.push(loc.postcode);

      return {
        id: place.fsq_id,
        name: place.name,
        address: addressParts.join(', ') || loc.formatted_address || '',
        city: loc.locality || loc.region || '',
        phone: place.tel || '',
        website: place.website || '',
        rating: place.rating ? place.rating / 2 : 0, // Foursquare uses 0-10, normalize to 0-5
        category: place.categories?.[0]?.name || category,
        source: 'foursquare',
        latitude: place.geocodes?.main?.latitude,
        longitude: place.geocodes?.main?.longitude
      };
    });

  } catch (error) {
    console.error('Error searching Foursquare:', error);
    return [];
  }
}

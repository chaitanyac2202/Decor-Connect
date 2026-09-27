// ===========================================
// TomTom Maps Search API Client
// ===========================================
// FREE tier — no credit card required
// 2,500 free requests per day.
//
// How to get your API key:
//   1. Go to https://developer.tomtom.com/
//   2. Register for a free account
//   3. Copy your API Key from the dashboard

const CATEGORY_MAP = {
  'Wall Art': 'Art Gallery',
  'Furniture': 'Furniture Store',
  'Lighting': 'Lighting Store',
  'Rugs': 'Rug Store',
  'Curtains': 'Curtain Store',
  'Vases & Decor Pieces': 'Home Decor Store',
  'Mirrors': 'Home Decor',
  'Candles': 'Gift Shop',
  'Garden Decor': 'Garden Center',
  'Other': 'Home Decor'
};

/**
 * Search TomTom POI API for businesses matching a category near a location.
 *
 * @param {string} category - Product category
 * @param {string} location - US city/state string (e.g. "New York, NY")
 * @returns {Promise<Array>} Normalized array of business objects
 */
export async function searchTomTom(category, location) {
  try {
    const apiKey = process.env.TOMTOM_API_KEY;
    if (!apiKey) {
      console.warn('TOMTOM_API_KEY is not set. Skipping TomTom search.');
      return [];
    }

    const searchTerm = CATEGORY_MAP[category] || 'Home Decor';
    // TomTom fuzzy search elegantly handles "Furniture Store in New York, NY"
    const query = `${searchTerm} in ${location}`;

    const url = new URL(`https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(query)}.json`);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('limit', '100');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`TomTom API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!data.results) return [];

    return data.results.map(place => {
      const poi = place.poi || {};
      const addr = place.address || {};
      
      return {
        id: 'tt_' + place.id,
        name: poi.name || '',
        address: addr.freeformAddress || `${addr.streetNumber || ''} ${addr.streetName || ''}`.trim(),
        city: addr.localName || addr.municipality || '',
        state: addr.countrySubdivision || '',
        phone: poi.phone || '',
        website: poi.url || '',
        category: poi.categories ? poi.categories.join(', ') : category,
        source: 'tomtom',
        latitude: place.position?.lat,
        longitude: place.position?.lon
      };
    });

  } catch (error) {
    console.error('Error searching TomTom:', error);
    return [];
  }
}

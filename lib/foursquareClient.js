// ===========================================
// Foursquare Places API Client
// ===========================================
// FREE tier
//
// How to get your API key:
//   1. Go to https://location.foursquare.com/developer/
//   2. Register for a free account
//   3. Copy your API Key

export async function searchFoursquare(category, location) {
  try {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) {
      console.warn('FOURSQUARE_API_KEY is not set. Skipping Foursquare search.');
      return [];
    }

    const searchTerm = category || 'Home Decor';
    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.append('query', searchTerm);
    url.searchParams.append('near', location);
    url.searchParams.append('limit', '50');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': apiKey
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Foursquare API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!data.results) return [];

    return data.results.map(place => {
      const location = place.location || {};
      return {
        id: 'fsq_' + place.fsq_id,
        name: place.name || '',
        address: location.address || '',
        city: location.locality || '',
        state: location.region || '',
        phone: place.tel || '',
        website: place.website || '',
        category: place.categories && place.categories.length > 0 ? place.categories[0].name : category,
        source: 'foursquare',
      };
    });

  } catch (error) {
    console.error('Error searching Foursquare:', error);
    return [];
  }
}

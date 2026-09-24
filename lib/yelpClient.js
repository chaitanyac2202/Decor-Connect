// Yelp API documentation: https://docs.developer.yelp.com/docs/getting-started
// You can get a YELP_API_KEY for free by creating an app at https://www.yelp.com/developers/v3/manage_app

export const CATEGORY_MAP = {
  'Wall Art': ['homedecor', 'artgalleries'],
  'Furniture': ['furniture', 'homedecor'],
  'Lighting': ['lighting', 'homedecor'],
  'Rugs': ['homedecor', 'carpeting'],
  'Curtains': ['homedecor', 'blinds'],
  'Vases & Decor Pieces': ['homedecor', 'homeandgarden'],
  'Mirrors': ['homedecor', 'glass'],
  'Candles': ['homedecor', 'candlestores'],
  'Garden Decor': ['homeandgarden', 'nurseriessupplies'],
  'Other': ['homedecor', 'furniture', 'homeandgarden']
};

export async function searchYelp(category, location) {
  try {
    const categories = CATEGORY_MAP[category] || CATEGORY_MAP['Other'];
    const categoriesStr = categories.join(',');

    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      console.warn('YELP_API_KEY is not set. Yelp search will fail or return empty.');
    }

    const url = new URL('https://api.yelp.com/v3/businesses/search');
    url.searchParams.append('categories', categoriesStr);
    url.searchParams.append('location', location);
    url.searchParams.append('limit', '50');
    url.searchParams.append('sort_by', 'best_match');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      console.error(`Yelp API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!data.businesses) return [];

    return data.businesses.map(b => ({
      id: b.id,
      name: b.name,
      address: b.location?.display_address?.join(', ') || '',
      city: b.location?.city || '',
      phone: b.phone || '',
      website: b.url || '', 
      rating: b.rating || 0,
      category: category, 
      source: 'yelp',
      latitude: b.coordinates?.latitude,
      longitude: b.coordinates?.longitude
    }));

  } catch (error) {
    console.error('Error searching Yelp:', error);
    return [];
  }
}

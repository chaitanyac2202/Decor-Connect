// ===========================================
// Nominatim + Overpass Buyer Discovery Client
// ===========================================
// Uses OpenStreetMap's free APIs — NO API key needed, completely free.
//
// 1. Nominatim: Geocodes a location string (city/state) to lat/lon coordinates
//    Docs: https://nominatim.org/release-docs/develop/api/Search/
//
// 2. Overpass: Searches for businesses near those coordinates
//    Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
//
// Both are free and require no sign-up or credit card.

// Maps DecorConnect product categories to OpenStreetMap shop/amenity tags
const CATEGORY_TAG_MAP = {
  'Wall Art': {
    shopTags: ['art', 'frame', 'gallery', 'craft', 'interior_decoration', 'houseware'],
    amenityTags: ['arts_centre'],
    query: 'art gallery decor'
  },
  'Furniture': {
    shopTags: ['furniture', 'interior_decoration', 'houseware', 'kitchen', 'bed', 'antiques'],
    amenityTags: [],
    query: 'furniture store'
  },
  'Lighting': {
    shopTags: ['lighting', 'electrical', 'interior_decoration', 'houseware', 'hardware'],
    amenityTags: [],
    query: 'lighting store'
  },
  'Rugs': {
    shopTags: ['carpet', 'interior_decoration', 'houseware', 'furniture'],
    amenityTags: [],
    query: 'rug carpet store'
  },
  'Curtains': {
    shopTags: ['curtain', 'fabric', 'interior_decoration', 'houseware', 'furniture'],
    amenityTags: [],
    query: 'curtain blinds store'
  },
  'Vases & Decor Pieces': {
    shopTags: ['gift', 'interior_decoration', 'houseware', 'garden_centre', 'florist'],
    amenityTags: [],
    query: 'home decor gift shop'
  },
  'Mirrors': {
    shopTags: ['glass', 'interior_decoration', 'houseware', 'furniture', 'frame'],
    amenityTags: [],
    query: 'mirror glass home decor'
  },
  'Candles': {
    shopTags: ['candles', 'gift', 'interior_decoration', 'houseware'],
    amenityTags: [],
    query: 'candle gift home decor'
  },
  'Garden Decor': {
    shopTags: ['garden_centre', 'garden_furniture', 'doityourself', 'outdoor', 'florist'],
    amenityTags: [],
    query: 'garden center nursery'
  },
  'Other': {
    shopTags: ['interior_decoration', 'houseware', 'furniture', 'gift', 'home_furnishings', 'department_store'],
    amenityTags: [],
    query: 'home decor furniture'
  }
};

/**
 * Geocode a location string to coordinates using Nominatim (free, no key).
 */
async function geocodeLocation(location) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DecorConnect/1.0 (home-decor-buyer-finder)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(`Nominatim error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Search OpenStreetMap Overpass API for businesses matching category tags.
 */
async function searchOverpassByCategory(lat, lon, category, radiusMeters = 30000) {
  try {
    const mapping = CATEGORY_TAG_MAP[category] || CATEGORY_TAG_MAP['Other'];
    const shopTags = mapping.shopTags;
    const amenityTags = mapping.amenityTags || [];

    // Build compact Overpass QL query (minimize whitespace for reliability)
    const shopParts = shopTags.map(tag =>
      `node["shop"="${tag}"](around:${radiusMeters},${lat},${lon});way["shop"="${tag}"](around:${radiusMeters},${lat},${lon});`
    ).join('');

    const amenityParts = amenityTags.map(tag =>
      `node["amenity"="${tag}"](around:${radiusMeters},${lat},${lon});way["amenity"="${tag}"](around:${radiusMeters},${lat},${lon});`
    ).join('');

    const query = `[out:json][timeout:30];(${shopParts}${amenityParts});out center body;`;

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let data = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'User-Agent': 'DecorConnect/1.0'
          },
          body: 'data=' + encodeURIComponent(query),
          cache: 'no-store'
        });

        if (response.ok) {
          data = await response.json();
          break; // Success!
        }
        console.warn(`Overpass API ${endpoint} failed: ${response.status}`);
      } catch (e) {
        console.warn(`Overpass API ${endpoint} error: ${e.message}`);
      }
    }

    if (!data || !data.elements) {
        console.error('All Overpass API endpoints failed.');
        return [];
    }

    const results = [];
    for (const element of data.elements) {
      if (!element.tags || !element.tags.name) continue;

      const tags = element.tags;
      const addrParts = [];
      if (tags['addr:housenumber']) addrParts.push(tags['addr:housenumber']);
      if (tags['addr:street']) addrParts.push(tags['addr:street']);
      if (tags['addr:city']) addrParts.push(tags['addr:city']);
      if (tags['addr:state']) addrParts.push(tags['addr:state']);
      if (tags['addr:postcode']) addrParts.push(tags['addr:postcode']);

      results.push({
        id: 'osm_' + element.id,
        name: tags.name,
        address: addrParts.join(', ') || '',
        city: tags['addr:city'] || '',
        state: tags['addr:state'] || '',
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || '',
        category: tags.shop || tags.amenity || 'unknown',
        source: 'openstreetmap',
        latitude: element.lat || element.center?.lat,
        longitude: element.lon || element.center?.lon,
        openingHours: tags.opening_hours || '',
        email: tags.email || tags['contact:email'] || null
      });
    }

    return results;
  } catch (error) {
    console.error('Overpass search error:', error);
    return [];
  }
}

/**
 * Search Nominatim directly for businesses matching a keyword near a location.
 * This is a complementary search to Overpass.
 */
async function searchNominatimPlaces(location, category) {
  try {
    const query = category;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' in ' + location)}&format=json&limit=50&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DecorConnect/1.0 (home-decor-buyer-finder)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) return [];

    const data = await response.json();

    return data
      .filter(item => item.type !== 'administrative' && item.type !== 'city' && item.type !== 'state')
      .map(item => ({
        id: 'nom_' + item.osm_id,
        name: item.name || item.display_name?.split(',')[0] || '',
        address: item.display_name || '',
        city: item.address?.city || item.address?.town || item.address?.village || '',
        state: item.address?.state || '',
        phone: '',
        website: '',
        category: item.type || category,
        source: 'nominatim',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }))
      .filter(item => item.name && item.name.length > 1);
  } catch (error) {
    console.error('Nominatim places search error:', error);
    return [];
  }
}

/**
 * Main discovery function — combines Overpass + Nominatim searches.
 * No API key required for any of this.
 *
 * @param {string} category - Product category
 * @param {string} location - US city/state string
 * @returns {Promise<Array>} Array of discovered businesses
 */
export async function discoverBuyers(category, location) {
  // Step 1: Geocode the location
  const coords = await geocodeLocation(location);
  if (!coords) {
    console.error('Could not geocode location:', location);
    return [];
  }

  console.log(`Geocoded "${location}" to ${coords.lat}, ${coords.lon}`);

  // Step 2: Search both sources in parallel
  const [overpassResults, nominatimResults] = await Promise.all([
    searchOverpassByCategory(coords.lat, coords.lon, category),
    searchNominatimPlaces(location, category)
  ]);

  console.log(`Found ${overpassResults.length} Overpass results, ${nominatimResults.length} Nominatim results`);

  // Step 3: Merge — Overpass first (better data), then Nominatim
  const allResults = [...overpassResults, ...nominatimResults];

  // Step 4: Deduplicate by normalized name
  const seenNames = new Set();
  const deduplicated = [];
  for (const item of allResults) {
    const normalizedName = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (normalizedName.length > 0 && !seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      deduplicated.push(item);
    }
  }

  return deduplicated;
}

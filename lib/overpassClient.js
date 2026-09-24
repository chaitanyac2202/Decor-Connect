// Overpass API allows querying OpenStreetMap data.
// No API key is needed, and it is completely free to use.
// Please be mindful of rate limits and terms of service.

export async function searchOverpass(latitude, longitude, radiusMeters = 25000) {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["shop"~"furniture|interior_decoration|houseware|home_furnishings"](around:${radiusMeters},${latitude},${longitude});
        way["shop"~"furniture|interior_decoration|houseware|home_furnishings"](around:${radiusMeters},${latitude},${longitude});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      console.error(`Overpass API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (!data.elements) return [];

    const results = [];
    for (const element of data.elements) {
      if (!element.tags || !element.tags.name) continue;

      const tags = element.tags;
      const addrParts = [];
      if (tags['addr:street']) addrParts.push(tags['addr:street']);
      if (tags['addr:city']) addrParts.push(tags['addr:city']);
      if (tags['addr:state']) addrParts.push(tags['addr:state']);
      if (tags['addr:postcode']) addrParts.push(tags['addr:postcode']);

      results.push({
        id: 'osm_' + element.id,
        name: tags.name,
        address: addrParts.join(', ') || '',
        city: tags['addr:city'] || '',
        phone: tags.phone || '',
        website: tags.website || '',
        category: tags.shop || 'unknown',
        source: 'openstreetmap',
        latitude: element.lat || element.center?.lat,
        longitude: element.lon || element.center?.lon
      });
    }

    return results;

  } catch (error) {
    console.error('Error searching Overpass:', error);
    return [];
  }
}

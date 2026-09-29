// ===========================================
// Google Places API (New) Client
// ===========================================

export async function searchGooglePlaces(category, location) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_PLACES_API_KEY is not set. Skipping Google search.');
      return [];
    }

    const searchTerm = category || 'Home Decor';
    const query = `${searchTerm} in ${location}`;
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Request only the fields we need to keep data transfer small
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.location'
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: 20 // Can fetch up to 20 per request
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Places API error: ${response.status} ${response.statusText}`, errorText);
      return [];
    }

    const data = await response.json();
    if (!data.places || data.places.length === 0) return [];

    return data.places.map(place => {
      // Parse address to get city and state (Google usually returns "Street, City, State ZIP, Country")
      const addressParts = place.formattedAddress ? place.formattedAddress.split(',') : [];
      let city = '';
      let state = '';
      if (addressParts.length >= 3) {
        city = addressParts[addressParts.length - 3].trim();
        state = addressParts[addressParts.length - 2].trim().split(' ')[0]; // Gets the state abbreviation usually
      }

      return {
        id: 'gpl_' + place.id,
        name: place.displayName?.text || '',
        address: place.formattedAddress || '',
        city: city,
        state: state,
        phone: place.nationalPhoneNumber || '',
        website: place.websiteUri || '',
        category: place.types && place.types.length > 0 ? place.types.join(', ').replace(/_/g, ' ') : category,
        source: 'google',
        latitude: place.location?.latitude,
        longitude: place.location?.longitude
      };
    });

  } catch (error) {
    console.error('Error searching Google Places:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return Response.json([]);
  }

  try {
    // We can use Nominatim for free city autocomplete
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&featuretype=city&limit=5`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DecorConnect/1.0 (home-decor-buyer-finder)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return Response.json([]);
    }

    const data = await response.json();
    
    // Map to just the display names, keeping them unique
    const uniquePlaces = [...new Set(data.map(item => {
      // Clean up the display name to something like "City, State, Country"
      const parts = item.display_name.split(',').map(p => p.trim());
      // Return the first 3 parts (usually City, County/State, Country)
      return parts.slice(0, 3).join(', ');
    }))];

    return Response.json(uniquePlaces);
  } catch (error) {
    console.error('Autocomplete error:', error);
    return Response.json([]);
  }
}

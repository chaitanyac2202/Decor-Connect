import { searchGooglePlaces } from '../../../lib/googlePlacesClient';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { itemsToRecover } = await request.json();
    
    if (!itemsToRecover || !Array.isArray(itemsToRecover)) {
      return Response.json({ error: 'Invalid items list' }, { status: 400 });
    }

    const results = {};

    // Do them in parallel but batched
    const BATCH_SIZE = 5;
    for (let i = 0; i < itemsToRecover.length; i += BATCH_SIZE) {
      const batch = itemsToRecover.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (item) => {
        try {
          // item has { name, location }
          const googleResults = await searchGooglePlaces(item.name, item.location);
          if (googleResults && googleResults.length > 0) {
            // Find the closest match by name
            const bestMatch = googleResults.find(g => 
              g.name.toLowerCase().includes(item.name.toLowerCase()) || 
              item.name.toLowerCase().includes(g.name.toLowerCase())
            );
            
            if (bestMatch && bestMatch.website) {
              results[item.name] = bestMatch.website;
              return;
            }
            if (googleResults[0].website) {
              results[item.name] = googleResults[0].website;
            }
          }
        } catch (e) {
          // ignore
        }
      });
      await Promise.all(promises);
      
      if (i + BATCH_SIZE < itemsToRecover.length) {
        await new Promise(r => setTimeout(r, 500)); // sleep slightly
      }
    }

    return Response.json({ recovered: results });
  } catch (error) {
    console.error('Error recovering websites:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

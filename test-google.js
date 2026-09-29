const apiKey = 'AIzaSyC0vpgNSgPvhODU6eSBo5ahE2oMxjupAoA';
const query = 'Home Decor in Anchorage, Alaska';

fetch('https://places.googleapis.com/v1/places:searchText', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.types,places.location'
  },
  body: JSON.stringify({
    textQuery: query,
    pageSize: 20
  })
}).then(r => r.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);

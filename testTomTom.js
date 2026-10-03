require('dotenv').config({ path: '.env.local' });
const { searchTomTom } = require('./lib/tomtomClient');

async function test() {
  // Mock fetch if necessary, or just run the imported function (needs fetch support in Node 18+)
  try {
    const res = await searchTomTom('Home Decor', 'Anchorage, Alaska');
    console.log(res.map(r => r.city + ', ' + r.state));
  } catch (e) {
    console.error(e);
  }
}
test();

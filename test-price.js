import { getCurrentPrice } from './lib/scraper.js';
async function test() {
    console.log("Fetching TCS...");
    const p1 = await getCurrentPrice('TCS');
    console.log("TCS price:", p1);
}
test();

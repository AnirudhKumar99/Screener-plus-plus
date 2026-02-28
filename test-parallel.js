import { getCurrentPrice } from './lib/scraper.js';
async function run() {
    const codes = ['TCS', 'INFY', 'WIPRO', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'SBI', 'ITC', 'LART', 'BAJFINANCE'];
    const results = await Promise.all(codes.map(c => getCurrentPrice(c)));
    console.log(results);
}
run();

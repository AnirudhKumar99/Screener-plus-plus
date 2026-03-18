import { getTop10Stocks } from './lib/scraper.js';
async function run() {
    const list = await getTop10Stocks('https://www.screener.in/screens/3506580/weekly-update/');
    console.log(list.map(s => s.stockCode));
}
run();

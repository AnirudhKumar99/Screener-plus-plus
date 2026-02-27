const { getTop10Stocks, getCurrentPrice } = require('./lib/scraper');

async function test() {
    console.log('Testing getTop10Stocks...');
    const top10 = await getTop10Stocks();
    console.log('Top 10 Stocks identified:');
    console.log(top10.map(t => `${t.stockCode} (${t.companyName}) - Score: ${t.score.toFixed(4)}`));

    if (top10.length > 0) {
        console.log('\nTesting getCurrentPrice for the top stock...');
        const firstStockCode = top10[0].stockCode;
        const price = await getCurrentPrice(firstStockCode);
        console.log(`Current price for ${firstStockCode}: ₹${price}`);
    }
}

test();

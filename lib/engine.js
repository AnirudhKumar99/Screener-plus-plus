import { prisma } from './prisma.js';
import { getTop10Stocks, getCurrentPrice } from './scraper.js';

async function runTradingEngine(screenerId) {
    console.log(`--- STARTING TRADING ENGINE RUN FOR ${screenerId} ---`);

    const screener = await prisma.screener.findUnique({ where: { id: screenerId } });
    if (!screener) {
        return { success: false, error: 'Screener not found' };
    }

    // Ensure wallet exists for this screener
    let wallet = await prisma.wallet.findUnique({ where: { screenerId } });
    if (!wallet) {
        wallet = await prisma.wallet.create({
            data: {
                screenerId: screenerId,
                cashBalance: 1000000.0 // 1 Million initial paper cash for this isolated screener
            }
        });
        console.log('Created initial wallet with ₹1,000,000');
    }

    // 1. Fetch current portfolio for this screener
    const currentPortfolio = await prisma.portfolio.findMany({ where: { screenerId } });
    console.log(`Current portfolio has ${currentPortfolio.length} stocks.`);

    // 2. Fetch new Top 10 Stocks from specific URL
    console.log(`Fetching new Top 10 from ${screener.url}...`);
    const newTop10 = await getTop10Stocks(screener.url);
    if (newTop10.length === 0) {
        console.log('Failed to fetch Top 10. Aborting engine run.');
        return { success: false, error: 'Failed to fetch Top 10' };
    }
    const newTop10Codes = newTop10.map(s => s.stockCode);

    let currentCash = wallet.cashBalance;

    // PHASE 1 & 2: Sync & Pool (Sell missing from Top 10)
    const stocksToSell = currentPortfolio.filter(p => !newTop10Codes.includes(p.stockCode));

    for (const stock of stocksToSell) {
        console.log(`Selling ${stock.companyName} (${stock.stockCode})...`);
        let sellPrice = await getCurrentPrice(stock.stockCode);
        if (!sellPrice) {
            console.warn(`Could not fetch live price for ${stock.stockCode}. Using avg buy price + 5% as fallback for simulation.`);
            sellPrice = stock.avgBuyPrice * 1.05;
        }

        const grossProceeds = stock.qty * sellPrice;
        const fee = grossProceeds * 0.01; // 1% fee
        const netProceeds = grossProceeds - fee;

        currentCash += netProceeds;

        // Log Transaction
        await prisma.transaction.create({
            data: {
                screenerId: screenerId,
                stockCode: stock.stockCode,
                action: 'SELL',
                qty: stock.qty,
                price: sellPrice,
                fees: fee
            }
        });

        // Remove from Portfolio
        await prisma.portfolio.delete({
            where: { screenerId_stockCode: { screenerId, stockCode: stock.stockCode } }
        });

        console.log(`Sold ${stock.qty} shares of ${stock.stockCode} at ₹${sellPrice}. Net proceeds: ₹${netProceeds.toFixed(2)}`);
    }

    // PHASE 3: Buy & Split
    const currentPortfolioCodes = currentPortfolio.map(p => p.stockCode);
    const entrantsToBuy = newTop10.filter(s => !currentPortfolioCodes.includes(s.stockCode));

    if (entrantsToBuy.length > 0) {
        const budgetPerStock = currentCash / entrantsToBuy.length;
        console.log(`Allocating ₹${budgetPerStock.toFixed(2)} to ${entrantsToBuy.length} new entrants.`);

        for (const entrant of entrantsToBuy) {
            console.log(`Buying new entrant: ${entrant.companyName} (${entrant.stockCode})`);
            const buyPrice = entrant.cmp || (await getCurrentPrice(entrant.stockCode));

            if (!buyPrice) {
                console.warn(`Could not fetch price for ${entrant.stockCode}. Skipping buy.`);
                continue;
            }

            // Max affordable shares accounting for 1% buy fee
            // Cost = qty * price * 1.01 <= budget
            // qty <= budget / (price * 1.01)
            const maxShares = Math.floor(budgetPerStock / (buyPrice * 1.01));

            if (maxShares > 0) {
                const grossCost = maxShares * buyPrice;
                const fee = grossCost * 0.01;
                const totalCost = grossCost + fee;

                currentCash -= totalCost;

                // Log Transaction
                await prisma.transaction.create({
                    data: {
                        screenerId: screenerId,
                        stockCode: entrant.stockCode,
                        action: 'BUY',
                        qty: maxShares,
                        price: buyPrice,
                        fees: fee
                    }
                });

                // Add to Portfolio
                await prisma.portfolio.create({
                    data: {
                        screenerId: screenerId,
                        stockCode: entrant.stockCode,
                        companyName: entrant.companyName,
                        qty: maxShares,
                        avgBuyPrice: buyPrice
                    }
                });

                console.log(`Bought ${maxShares} shares of ${entrant.stockCode} at ₹${buyPrice}. Total cost: ₹${totalCost.toFixed(2)}`);
            } else {
                console.log(`Budget ₹${budgetPerStock.toFixed(2)} too low to buy even 1 share of ${entrant.stockCode} at ₹${buyPrice}`);
            }
        }
    }

    // Save new Wallet state
    await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
            cashBalance: currentCash,
            lastUpdated: new Date()
        }
    });

    // PHASE 4: Valuation (Net Worth History)
    console.log('Calculating new Net Worth scope...');
    const updatedPortfolio = await prisma.portfolio.findMany({ where: { screenerId } });
    let totalHoldingsValue = 0;

    for (const item of updatedPortfolio) {
        let livePrice = await getCurrentPrice(item.stockCode);
        if (!livePrice) livePrice = item.avgBuyPrice; // Fallback to avoid breaking valuation
        totalHoldingsValue += (item.qty * livePrice);
    }

    const totalNetWorth = currentCash + totalHoldingsValue;

    await prisma.netWorthHistory.create({
        data: {
            screenerId: screenerId,
            totalNetWorth: totalNetWorth
        }
    });

    console.log(`Engine run complete! New Net Worth: ₹${totalNetWorth.toFixed(2)} (Cash: ₹${currentCash.toFixed(2)})`);
    return { success: true, netWorth: totalNetWorth, cash: currentCash };
}

export { runTradingEngine };

const { runTradingEngine } = require('./lib/engine');
const { prisma } = require('./lib/prisma');

async function test() {
    try {
        const result = await runTradingEngine();
        console.log('Result:', result);

        console.log('\n--- VERIFICATION ---');
        const wallet = await prisma.wallet.findFirst();
        console.log('Wallet Cash:', wallet.cashBalance.toFixed(2));

        const portfolio = await prisma.portfolio.findMany();
        console.log(`Portfolio Holdings: ${portfolio.length}`);
        for (let p of portfolio) {
            console.log(`- ${p.stockCode}: ${p.qty} shares @ ₹${p.avgBuyPrice}`);
        }

        const transactions = await prisma.transaction.findMany();
        console.log(`Transactions Logged: ${transactions.length}`);

        const netWorthHistory = await prisma.netWorthHistory.findMany({ orderBy: { recordDate: 'desc' }, take: 1 });
        console.log(`Latest Net Worth: ₹${netWorthHistory[0].totalNetWorth.toFixed(2)}`);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();

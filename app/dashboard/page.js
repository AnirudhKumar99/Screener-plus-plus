import { prisma } from '@/lib/prisma';
import { getCurrentPrice } from '@/lib/scraper';
import { KPIStats } from '@/components/KPIStats';
import { NetWorthChart } from '@/components/NetWorthChart';
import { PortfolioAllocation } from '@/components/PortfolioAllocation';
import { HoldingsTable } from '@/components/HoldingsTable';
import { TransactionsTable } from '@/components/TransactionsTable';
import { DashboardClient } from '@/components/DashboardClient';
import { ScreenerManager } from '@/components/ScreenerManager';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TrendingUp } from 'lucide-react';

// Next.js config to ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }) {
    // Await params per Next 15+ convention
    const awaitedParams = await searchParams;
    const activeScreenerId = awaitedParams.screenerId;

    // Fetch all screeners broadly available
    const screeners = await prisma.screener.findMany({ orderBy: { name: 'asc' } });

    // If no activeScreenerId is selected but we have screeners, we default to showing the UI blanked out needing selection
    const activeScreener = screeners.find(s => s.id === activeScreenerId);

    // Fetch Scoped Wallet
    let wallet = null;
    let currentCash = 0;
    if (activeScreenerId) {
        wallet = await prisma.wallet.findUnique({ where: { screenerId: activeScreenerId } });
        currentCash = wallet ? wallet.cashBalance : 0;
    }

    // Fetch scoped holdings
    const portfolio = activeScreenerId ? await prisma.portfolio.findMany({
        where: { screenerId: activeScreenerId },
        orderBy: { qty: 'desc' }
    }) : [];

    // Calculate current holdings valuation and fetch live CMP sequentially to prevent 429
    const portfolioWithPrices = [];
    for (const item of portfolio) {
        let cmp = await getCurrentPrice(item.stockCode);
        if (!cmp) cmp = item.avgBuyPrice;
        portfolioWithPrices.push({ ...item, cmp });
    }

    const holdingsValuation = portfolioWithPrices.reduce((sum, item) => sum + (item.qty * item.cmp), 0);
    const currentNetWorth = currentCash + holdingsValuation;

    // Total Capital deployed is the sum of avg entry valuations
    const deployedCapital = holdingsValuation;

    // Fetch net worth history for chart
    const history = activeScreenerId ? await prisma.netWorthHistory.findMany({
        where: { screenerId: activeScreenerId },
        orderBy: { recordDate: 'asc' }
    }) : [];

    // Fetch recent transactions
    const transactions = activeScreenerId ? await prisma.transaction.findMany({
        where: { screenerId: activeScreenerId },
        orderBy: { date: 'desc' },
        take: 50
    }) : [];

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3">
                        <span className="bg-blue-600 text-white p-2 rounded-lg"><TrendingUp size={28} /></span>
                        QuantTrader {activeScreener ? `- ${activeScreener.name}` : ''}
                    </h1>
                    <p className="text-slate-500 mt-2">Zero-touch paper trading algorithmic dashboard</p>
                </div>
                <div className="flex items-center space-x-4">
                    <ScreenerManager initialScreeners={screeners} />
                    <ThemeToggle />
                    <DashboardClient activeScreenerId={activeScreenerId} />
                </div>
            </div>

            {!activeScreenerId ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-12 text-center">
                    <h2 className="text-2xl font-bold mb-4">Welcome to QuantTrader</h2>
                    <p className="text-slate-500 mb-6">Create a new Screener Strategy or select an existing one to view your portfolio and trigger algorithms.</p>
                </div>
            ) : (
                <>
                    <KPIStats
                        netWorth={currentNetWorth}
                        cash={currentCash}
                        deployedCapital={deployedCapital}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2">
                            <NetWorthChart data={history} />
                        </div>
                        <div>
                            <PortfolioAllocation portfolio={portfolio} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 pb-12">
                        <HoldingsTable portfolio={portfolioWithPrices} />
                        <TransactionsTable transactions={transactions} />
                    </div>
                </>
            )}
        </main>
    );
}

import { prisma } from '@/lib/prisma';
import { getCurrentPrice } from '@/lib/scraper';
import { KPIStats } from '@/components/KPIStats';
import { NetWorthChart } from '@/components/NetWorthChart';
import { PortfolioAllocation } from '@/components/PortfolioAllocation';
import { HoldingsTable } from '@/components/HoldingsTable';
import { TransactionsTable } from '@/components/TransactionsTable';
import { DashboardClient } from '@/components/DashboardClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TrendingUp } from 'lucide-react';

// Next.js config to ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // Fetch Wallet (with fallback if new)
    let wallet = await prisma.wallet.findFirst();
    let currentCash = wallet ? wallet.cashBalance : 1000000;

    // Fetch all holdings
    const portfolio = await prisma.portfolio.findMany({
        orderBy: { qty: 'desc' }
    });

    // Calculate current holdings valuation and fetch live CMP
    const portfolioWithPrices = await Promise.all(portfolio.map(async (item) => {
        let cmp = await getCurrentPrice(item.stockCode);
        if (!cmp) cmp = item.avgBuyPrice;
        return { ...item, cmp };
    }));

    const holdingsValuation = portfolioWithPrices.reduce((sum, item) => sum + (item.qty * item.cmp), 0);
    const currentNetWorth = currentCash + holdingsValuation;

    // Total Capital deployed is the sum of avg entry valuations
    const deployedCapital = holdingsValuation;

    // Fetch net worth history for chart
    const history = await prisma.netWorthHistory.findMany({
        orderBy: { recordDate: 'asc' }
    });

    // Fetch recent transactions
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3">
                        <span className="bg-blue-600 text-white p-2 rounded-lg"><TrendingUp size={28} /></span>
                        QuantTrader
                    </h1>
                    <p className="text-slate-500 mt-2">Zero-touch paper trading algorithmic dashboard</p>
                </div>
                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <DashboardClient />
                </div>
            </div>

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
        </main>
    );
}

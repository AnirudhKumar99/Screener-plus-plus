import { Wallet, TrendingUp, PieChart } from "lucide-react";

export function KPIStats({ netWorth, cash, deployedCapital }) {
    const kpis = [
        {
            title: "Current Net Worth",
            value: `₹${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <TrendingUp className="text-green-500" size={24} />,
            color: "bg-green-100 dark:bg-green-900/30",
        },
        {
            title: "Available Cash",
            value: `₹${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <Wallet className="text-blue-500" size={24} />,
            color: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            title: "Total Deployed Capital",
            value: `₹${deployedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: <PieChart className="text-purple-500" size={24} />,
            color: "bg-purple-100 dark:bg-purple-900/30",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex items-center space-x-4 transition-all hover:shadow-md">
                    <div className={`p-4 rounded-full ${kpi.color}`}>
                        {kpi.icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

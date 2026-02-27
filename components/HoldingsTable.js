export function HoldingsTable({ portfolio }) {
    if (!portfolio || portfolio.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 text-center text-slate-500 py-12">
                Portfolio is empty.
            </div>
        );
    }

    // Calculate total investment to show weights
    const totalInvestment = portfolio.reduce((sum, item) => sum + (item.qty * item.cmp), 0);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Holdings</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Stock</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Shares</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Avg Entry</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">CMP</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Current Value</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Weight</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {portfolio.map((item) => {
                            const invested = item.qty * item.cmp;
                            const weight = totalInvestment > 0 ? (invested / totalInvestment) * 100 : 0;
                            const isUp = item.cmp >= item.avgBuyPrice;

                            return (
                                <tr key={item.stockCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            <a href={`https://www.screener.in/company/${item.stockCode}/`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                                {item.stockCode}
                                            </a>
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">{item.qty}</td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                                        ₹{item.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-medium ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        ₹{item.cmp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        ₹{invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="flex items-center justify-end">
                                            <span className="mr-2">{weight.toFixed(1)}%</span>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 max-w-[60px]">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${weight}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

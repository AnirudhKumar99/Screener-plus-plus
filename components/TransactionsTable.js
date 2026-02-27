export function TransactionsTable({ transactions }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 text-center text-slate-500 py-12">
                No transactions recorded yet.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Action</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Stock</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Shares</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Price</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Total Val</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right text-red-500 dark:text-red-400">Fees</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {transactions.map((tx) => {
                            const isBuy = tx.action === 'BUY';
                            const badgeColors = isBuy
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";

                            const totalVal = tx.qty * tx.price;

                            return (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        <div className="text-xs text-slate-400">{new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${badgeColors}`}>
                                            {tx.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{tx.stockCode}</td>
                                    <td className="px-6 py-4 text-right font-medium">{tx.qty}</td>
                                    <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                                        ₹{tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">
                                        ₹{totalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-500 dark:text-red-400">
                                        -₹{tx.fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

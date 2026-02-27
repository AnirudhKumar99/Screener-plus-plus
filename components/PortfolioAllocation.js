"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from 'next-themes';

export function PortfolioAllocation({ portfolio }) {
    const { theme } = useTheme();

    if (!portfolio || portfolio.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <p>No holdings currently.</p>
            </div>
        );
    }

    // Calculate value for pie slices (qty * avgBuyPrice)
    const data = portfolio.map(item => ({
        name: item.stockCode,
        value: item.qty * item.avgBuyPrice,
        company: item.companyName
    })).sort((a, b) => b.value - a.value); // Sort by value

    // Pleasant color palette suitable for both dark and light
    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

    const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Portfolio Allocation</h3>
            <div className="flex-grow w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${gridColor}`, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                            formatter={(value, name, props) => [`₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, props.payload.company]}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

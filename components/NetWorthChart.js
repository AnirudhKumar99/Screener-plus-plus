"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

export function NetWorthChart({ data }) {
    const { theme } = useTheme();
    const textColor = theme === 'dark' ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 / slate-200
    const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff'; // slate-800 / white

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <p>No history data available yet.</p>
            </div>
        );
    }

    // Format date for chart
    const chartData = data.map(d => ({
        ...d,
        dateValue: new Date(d.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Net Worth Growth</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="dateValue"
                            tick={{ fill: textColor, fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: gridColor }}
                        />
                        <YAxis
                            tick={{ fill: textColor, fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${gridColor}`, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Net Worth']}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalNetWorth"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

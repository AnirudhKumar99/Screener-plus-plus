'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function ScreenerManager({ initialScreeners }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeId = searchParams.get('screenerId');

    const [screeners, setScreeners] = useState(initialScreeners || []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [weights, setWeights] = useState({
        wRoce: 0.15,
        wRoce3Yr: 0.15,
        wQtrProfitVar: 0.10,
        wQtrSalesVar: 0.10,
        wProfitVar3Yrs: 0.10,
        wSalesVar3Yrs: 0.10,
        wDivYld: 0.05,
        wMarCap: 0.05,
        wInvertedPe: 0.20
    });

    const weightLabels = {
        wRoce: 'ROCE %',
        wRoce3Yr: 'ROCE 3Yr %',
        wQtrProfitVar: 'Qtr Profit Var %',
        wQtrSalesVar: 'Qtr Sales Var %',
        wProfitVar3Yrs: 'Profit Var 3Yrs %',
        wSalesVar3Yrs: 'Sales Var 3Yrs %',
        wDivYld: 'Dividend Yield %',
        wMarCap: 'Market Cap',
        wInvertedPe: 'P/E (Inverted)'
    };

    const weightOptions = Array.from({ length: 21 }, (_, i) => (i * 0.05).toFixed(2));

    // JS floats are messy, round safely
    const totalWeight = Math.round(Object.values(weights).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) * 100) / 100;
    const isValidWeights = totalWeight === 1.00;

    const handleSelect = (e) => {
        const id = e.target.value;
        if (id) {
            router.push(`/dashboard?screenerId=${id}`);
        } else {
            router.push('/dashboard');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/screeners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url, ...weights })
            });
            if (res.ok) {
                const newScreener = await res.json();
                setScreeners([...screeners, newScreener]);
                setIsModalOpen(false);
                setName('');
                setUrl('');
                // Reset weights to default
                setWeights({
                    wRoce: 0.15, wRoce3Yr: 0.15, wQtrProfitVar: 0.10,
                    wQtrSalesVar: 0.10, wProfitVar3Yrs: 0.10, wSalesVar3Yrs: 0.10,
                    wDivYld: 0.05, wMarCap: 0.05, wInvertedPe: 0.20
                });
                toast.success('Strategy created!');
                router.push(`/dashboard?screenerId=${newScreener.id}`);
            } else {
                toast.error('Failed to create screener');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <select
                title="ScreenerStrategy"
                value={activeId || ''}
                onChange={handleSelect}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="" disabled>Select a Screener</option>
                {screeners.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                title="Add New Screener"
            >
                <Plus size={20} />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create Screener & Strategy</h2>
                        <form onSubmit={handleCreate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Screener Daily"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Screener.in URL</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://www.screener.in/screens/..."
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Algorithm Weight Multipliers</h3>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isValidWeights ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        Total: {totalWeight.toFixed(2)} / 1.00
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                                    {Object.entries(weightLabels).map(([key, label]) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                                            <select
                                                value={Number(weights[key]).toFixed(2)}
                                                onChange={e => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {weightOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isValidWeights}
                                    title={!isValidWeights ? "Weights must sum exactly to 1.00" : ""}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Strategy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

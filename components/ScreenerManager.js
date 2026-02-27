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

    const handleSelect = (e) => {
        const id = e.target.value;
        if (id) {
            router.push(`/?screenerId=${id}`);
        } else {
            router.push('/');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/screeners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url })
            });
            if (res.ok) {
                const newScreener = await res.json();
                setScreeners([...screeners, newScreener]);
                setIsModalOpen(false);
                setName('');
                setUrl('');
                toast.success('Screener created!');
                router.push(`/?screenerId=${newScreener.id}`);
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Screener</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Screener Daily"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Screener.in URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://www.screener.in/screens/..."
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Screener'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

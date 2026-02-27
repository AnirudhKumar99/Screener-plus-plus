'use client';

import { useState } from "react";
import { Play } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function DashboardClient({ activeScreenerId }) {
    const router = useRouter();
    const [isRunning, setIsRunning] = useState(false);

    const handleRunEngine = async () => {
        if (!activeScreenerId) return;

        setIsRunning(true);
        const toastId = toast.loading("Executing quantitative model and rebalancing portfolio...");

        try {
            // In a real app, you'd want a secure way to pass the cron token, 
            // but for this dashboard we use it to emulate the cron job
            const response = await fetch('/api/run-engine', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer dev-secret-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ screenerId: activeScreenerId })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Rebalancing complete! New Net Worth: ₹${data.netWorth?.toLocaleString()}`, { id: toastId, duration: 4000 });
                router.refresh(); // Tells Next.js to re-fetch Server Components (app/page.js)
            } else {
                toast.error(`Engine returned error: ${data.error}`, { id: toastId, duration: 5000 });
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error.message}`, { id: toastId, duration: 5000 });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <button
            onClick={handleRunEngine}
            disabled={isRunning || !activeScreenerId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm
                ${isRunning || !activeScreenerId ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'}`}
        >
            <Play size={16} className={isRunning ? 'animate-pulse' : ''} />
            {isRunning ? 'Running...' : 'Run Engine'}
        </button>
    );
}

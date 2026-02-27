"use client";

import { useState } from "react";
import { Play, RotateCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function DashboardClient() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRunEngine = async () => {
        setLoading(true);
        const toastId = toast.loading("Executing quantitative model and rebalancing portfolio...");

        try {
            // In production, the cronSecret matches what's in the env. For demo, we use dev-secret-token.
            const res = await fetch("/api/run-engine", {
                headers: {
                    'Authorization': 'Bearer dev-secret-token'
                }
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Rebalancing complete! New Net Worth: ₹${data.netWorth?.toLocaleString()}`, { id: toastId, duration: 4000 });
                router.refresh(); // Tells Next.js to re-fetch Server Components (app/page.js)
            } else {
                throw new Error(data.error || "Execution failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error.message}`, { id: toastId, duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleRunEngine}
            disabled={loading}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <RotateCw className="animate-spin" size={18} />
            ) : (
                <Play size={18} />
            )}
            <span>{loading ? "Engine Running..." : "Force Run Engine"}</span>
        </button>
    );
}

import Link from 'next/link';
import { TrendingUp, ShieldCheck, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
                    <div className="flex lg:flex-1 items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-lg"><TrendingUp size={24} /></div>
                        <span className="font-extrabold text-xl tracking-tight">QuantTrader</span>
                    </div>
                    <div className="flex flex-1 justify-end items-center gap-6">
                        <ThemeToggle />
                        <Link href="/login" className="text-sm font-semibold leading-6 hover:text-blue-600 transition-colors">Log in</Link>
                        <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
                            Launch App
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="relative isolate pt-14">
                {/* Background Glow */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                </div>

                {/* Hero */}
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white mb-6">
                                Zero-touch algorithm paper trading.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                                Build secure financial sandboxes, hook up custom Screener.in formulas, and tweak hyper-parameter weightages to backtest quantitative strategies over live Indian markets.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link href="/register" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all flex items-center gap-2 group">
                                    Start Sandboxing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white group">
                                    Learn more <span className="inline-block transition-transform group-hover:translate-y-1">↓</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div id="features" className="py-24 sm:py-32 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl lg:text-center">
                            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Deploy Faster</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Everything you need to automate trades</p>
                        </div>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <ShieldCheck size={24} />
                                        </div>
                                        Isolated Sandboxes
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Launch limitless completely independent strategies. Every screener starts with exactly ₹1,000,000 in paper capital and never bleeds logic.</dd>
                                </div>
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <Zap size={24} />
                                        </div>
                                        Dynamic Weightages
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Prioritize ROCE or heavily penalize Debt? Tweak 9 distinct financial multipliers ranging from 0.00 to 1.00 directly from your Dashboard.</dd>
                                </div>
                                <div className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-slate-900 dark:text-white">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                            <BarChart3 size={24} />
                                        </div>
                                        Live Price Fetching
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">Our native engine avoids bans and parses real-time metrics, dynamically adjusting entry gaps against Current Market Price.</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

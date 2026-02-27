import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Quant Paper Trading System',
    description: 'Zero-touch quantitative paper trading dashboard',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen flex flex-col`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster position="bottom-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}

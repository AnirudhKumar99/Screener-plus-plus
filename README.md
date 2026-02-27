# QuantTrader - Quantitative Paper Trading System

A Next.js (App Router) based zero-touch quantitative paper trading system. This application automatically scrapes financial data, ranks stocks based on a custom algorithm, manages a virtual portfolio in a SQLite database, and provides a real-time interactive dashboard.

## 🏗️ Project Structure

The project follows a standard Next.js App Router structure with dedicated directories for the database and core trading logic.

```text
stocks_nodejs/
├── app/                        # Next.js App Router (Frontend & API)
│   ├── api/run-engine/         # Serverless API endpoint to manually trigger the trading engine
│   ├── layout.js               # Root layout, includes the NextThemes provider
│   ├── page.js                 # Main Dashboard Server Component (Fetches SQLite data)
│   └── globals.css             # Tailwind & Global styles
├── components/                 # Reusable React UI Components
│   ├── DashboardClient.js      # Client component spanning the "Force Run Engine" button and toast logic
│   ├── HoldingsTable.js        # Server-rendered table displaying current portfolio & live CMP
│   ├── KPIStats.js             # Top-level cards for Net Worth, Cash, Deployed Capital
│   ├── NetWorthChart.js        # Recharts interactive line chart
│   ├── PortfolioAllocation.js  # Recharts pie chart for portfolio weighting
│   ├── ThemeProvider.js        # next-themes wrapper
│   └── TransactionsTable.js    # Paginated log of historical BUYS and SELLS
├── lib/                        # Core Backend Logic
│   ├── engine.js               # Algorithmic Trading Engine (Sync, Sell, Buy, Value phases)
│   ├── prisma.js               # Prisma ORM singleton client
│   └── scraper.js              # Cheerio web scraper and normalization/ranking math
├── prisma/                     # Database Schema & File
│   ├── dev.db                  # Local SQLite database file
│   └── schema.prisma           # Prisma Schema defining Wallet, Portfolio, Transaction, NetWorthHistory
├── test-engine.js              # Sandbox script to test engine
└── test-scraper.js             # Sandbox script to test Screener.in limits
```

## 🔍 Key Screener URLs & How They Are Used

This system relies on live market data scraped directly from [Screener.in](https://screener.in). 

The `lib/scraper.js` file primarily uses these two dynamic URLs:

### 1. The Screen Ranking Query (Top 10 Finder)
🔗 **URL:** `https://www.screener.in/screens/3506580/weekly-update/?page={X}`
*   **What it does:** This URL points to a specific custom screen created on Screener.in that filters the entire Indian stock market down to a broad list of candidates based on specific fundamental minimums.
*   **How the app uses it:** The `getTop10Stocks()` function uses `cheerio` and `axios` to iterate through the tabular data on this page (handling pagination via the `?page=X` query parameter). It extracts 9 fundamental metrics (like ROCE %, P/E, Market Cap, etc.), applies **Min-Max Normalization** to score them between 0 and 1, and then mathematically ranks the absolute Top 10 stocks to buy based on a weighted algorithmic formula.

### 2. The Individual Company Live Price Query
🔗 **URL:** `https://www.screener.in/company/{STOCK_CODE}/`
*   **What it does:** This URL points to a specific company's detailed fundamental page (e.g. `https://www.screener.in/company/TCS/`). It contains real-time summary ratios.
*   **How the app uses it:** The `getCurrentPrice(stockCode)` function visits this URL specifically to scrape the **"Current Price"** (CMP) node from the DOM. This value is used by:
    1.  The **Trading Engine**: To calculate exactly how many integer shares can be afforded with the available wallet cash, and to determine the net profit/loss on selling.
    2.  The **Dashboard UI**: To render real-time valuation of the current holding positions and color-code the CMP red or green based on the initial entry price.

## 🚀 Getting Started Locally

1. Install Dependencies
```bash
npm install
```

2. Initialize the Prisma SQLite Database
```bash
npx prisma db push
```

3. Run the Development Server
```bash
npm run dev
```

4. Open `http://localhost:3000` to view the dashboard! You can trigger the engine directly from the UI.

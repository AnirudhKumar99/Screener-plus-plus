# QuantTrader - Quantitative Paper Trading System 📈

A Next.js (App Router) based zero-touch quantitative paper trading system. This application automatically scrapes financial data, ranks stocks based on a custom algorithm, manages a virtual portfolio in a SQLite database, and provides a real-time interactive dashboard.

## 🌟 `feat_multiple_screeners` Branch Features

This branch introduces Native Multi-Tenant Sandboxing—the ability to run limitless parallel trading strategies without their data colliding.

### 1. Isolated Sub-Wallets & Portfolios
Every single Screener URL you add to the system creates a disjointed "sandbox".
* **Independent Capital:** When a strategy runs for the first time, a fresh ₹1,000,000 (10 Lakhs) Wallet is instantiated strictly mapped to that Screener.
* **Isolated Trading:** `Portfolio` holdings, `Transactions` (Buys/Sells), and `NetWorthHistory` records apply a cascading `screenerId` Foreign Key. A bad strategy's losses won't bleed into your high-dividend strategy's capital!

### 2. Context-Aware Visual Dashboard
The frontend `app/page.js` is now completely driven by URL parameters (`/?screenerId=XYZ`).
* **Screener Manager Dropdown:** Allows you to instantly switch the entire app's context between databases views.
* **Add Screeners on the Fly:** Click the `+` icon to save a new Name and Screener.in URL to the SQLite database.

### 3. Safe Database Migration (`multi.db`)
Rather than risking data corruption on your existing `dev.db`, this branch uses a brand new SQLite database file `multi.db` ensuring safe backwards compatibility with the primary project branch.

---

## 🏗️ Project Structure

The project follows a standard Next.js App Router structure with dedicated directories for the database and core trading logic.

```text
stocks_nodejs/
├── app/                        
│   ├── api/run-engine/         # POST endpoint to manually trigger a screener's engine
│   ├── api/screeners/          # GET/POST endpoint to fetch & create Screener URLs
│   ├── layout.js               # Root layout, includes the NextThemes provider
│   ├── page.js                 # Main Dashboard Server Component (Dynamically filtered by ?screenerId)
│   └── globals.css             # Tailwind & Global styles
├── components/                 
│   ├── DashboardClient.js      # Client component spanning the "Run Engine" dispatcher
│   ├── ScreenerManager.js      # Dropdown selector and "Add Screener" Modal UI
│   ├── HoldingsTable.js        # Server-rendered table displaying current isolated portfolio 
│   ├── KPIStats.js             # Top-level cards for Net Worth, Cash, Deployed Capital
│   ├── NetWorthChart.js        # Recharts interactive line chart showing isolated history
│   ├── PortfolioAllocation.js  # Recharts pie chart for portfolio weighting
│   ├── ThemeProvider.js        # next-themes wrapper
│   └── TransactionsTable.js    # Paginated log of historical BUYS and SELLS
├── lib/                        
│   ├── engine.js               # Algorithmic Trading Engine (Sync, Sell, Buy, Value phases)
│   ├── prisma.js               # Prisma ORM singleton client
│   └── scraper.js              # Cheerio web scraper supporting dynamic screenerUrl ingestion
├── prisma/                     
│   ├── multi.db                # Local Sandbox SQLite database file
│   └── schema.prisma           # Prisma Schema defining Screener, Wallet, Portfolio, Transaction, NetWorthHistory
└── test-scripts/               # Sandbox scratchpads
```

---

## 🔍 Key Screener URLs & How They Are Used

This system relies on live market data scraped directly from [Screener.in](https://screener.in). Rather than hardcoding one strategy, the application now supports injecting **any valid** Screener.in URL dynamically!

### 1. The Dynamic Strategy Query (Top 10 Finder)
🔗 **Example URL:** `https://www.screener.in/screens/3506580/weekly-update/`
*   **What it does:** This URL points to a custom filter/screen created on Screener.in. It narrows down the 4000+ Indian stocks into a targeted list based on fundamental minimums (e.g. "Debt to equity < 1 AND Market Cap > 500").
*   **How the app uses it:** 
    1. You add this URL via the Dashboard UI `+` Button.
    2. When you click **Run Engine**, the `POST /api/run-engine` grabs this exact URL from the database for your active strategy.
    3. The `getTop10Stocks(screenerUrl)` scraper loops through every page of results appending `?page={X}`. 
    4. It extracts 9 fundamental metrics (like ROCE %, P/E, Market Cap, etc.), applies **Min-Max Normalization** to score them between 0 and 1, and mathematically ranks the absolute Top 10 stocks for that specific strategy.

### 2. The Individual Company Live Price Query
🔗 **URL:** `https://www.screener.in/company/{STOCK_CODE}/`
*   **What it does:** This URL points to a specific company's detailed fundamental page (e.g. `https://www.screener.in/company/TCS/`). It contains real-time summary ratios.
*   **How the app uses it:** The `getCurrentPrice(stockCode)` function securely visits this URL specifically to scrape the **"Current Price"** (CMP) node from the DOM. This ensures your isolated simulation uses live, to-the-second market rates for:
    1.  **Trading Execution**: Calculating exactly how many integer shares can be afforded with the given sandbox's cash.
    2.  **Dashboard UI**: Rendering real-time valuation of the current holding positions and color-coding price deltas.

---

## 🚀 Getting Started Locally

1. Install Dependencies
```bash
npm install
```

2. Push the highly relational schema to `multi.db`
```bash
npx prisma db push
```

3. Run the Development Server
```bash
npm run dev
```

4. Open `http://localhost:3000` to view the dashboard! You will be prompted to add your first Custom Screener Strategy.

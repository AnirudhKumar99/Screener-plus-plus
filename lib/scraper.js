import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

const SCREENER_URL = 'https://www.screener.in/screens/3506580/weekly-update/';
const BASE_URL = 'https://www.screener.in';

async function fetchScreenerPage(page = 1) {
    const userAgent = new UserAgent();
    try {
        const response = await axios.get(`${SCREENER_URL}?page=${page}`, {
            headers: {
                'User-Agent': userAgent.toString(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching Screener page ${page}:`, error.message);
        return null;
    }
}

function parseScreenerData(html) {
    const $ = cheerio.load(html);
    const data = [];
    const rows = $('table.data-table tbody tr');

    if (rows.length === 0) return data; // Ensure we handle empty pages

    rows.each((i, row) => {
        const cols = $(row).find('td');
        if (cols.length > 0) {
            // Columns (Example, varies by screen but assuming standard for this screen):
            // 1. S.No. 2. Name 3. CMP 4. P/E 5. Mar Cap 6. Div Yld % 7. ROCE % 8. Qtr Profit Var % 9. Qtr Sales Var % 10. ROCE 3Yr % 11. Profit Var 3Yrs % 12. Sales Var 3Yrs %

            const stockLink = $(cols[1]).find('a').attr('href');
            const stockCode = stockLink ? stockLink.split('/').filter(p => p && p !== 'company' && p !== 'consolidated')[0] : null;
            const companyName = $(cols[1]).find('a').text().trim();

            const parseNumber = (text) => {
                if (!text) return 0;
                const val = parseFloat(text.replace(/,/g, ''));
                return isNaN(val) ? 0 : val;
            };

            if (!stockCode) return; // skip if no link found

            data.push({
                stockCode,
                companyName,
                cmp: parseNumber($(cols[2]).text()),
                pe: parseNumber($(cols[3]).text()),
                marCap: parseNumber($(cols[4]).text()),
                divYld: parseNumber($(cols[5]).text()),
                roce: parseNumber($(cols[6]).text()),
                qtrProfitVar: parseNumber($(cols[7]).text()),
                qtrSalesVar: parseNumber($(cols[8]).text()),
                roce3Yr: parseNumber($(cols[9]).text()),
                profitVar3Yrs: parseNumber($(cols[10]).text()),
                salesVar3Yrs: parseNumber($(cols[11]).text()),
            });
        }
    });

    return data;
}

function normalizeData(data) {
    if (data.length === 0) return [];

    // Helper to find min/max
    const getMinMax = (field) => {
        const values = data.map(d => d[field]);
        return { min: Math.min(...values), max: Math.max(...values) };
    };

    const bounds = {
        pe: getMinMax('pe'),
        marCap: getMinMax('marCap'),
        divYld: getMinMax('divYld'),
        roce: getMinMax('roce'),
        qtrProfitVar: getMinMax('qtrProfitVar'),
        qtrSalesVar: getMinMax('qtrSalesVar'),
        roce3Yr: getMinMax('roce3Yr'),
        profitVar3Yrs: getMinMax('profitVar3Yrs'),
        salesVar3Yrs: getMinMax('salesVar3Yrs'),
    };

    const normalize = (val, min, max) => {
        if (max === min) return 0;
        return (val - min) / (max - min);
    };

    return data.map(item => {
        const normalizedPe = normalize(item.pe, bounds.pe.min, bounds.pe.max);

        return {
            ...item,
            norm: {
                invertedPe: 1 - normalizedPe, // Lower P/E is better
                marCap: normalize(item.marCap, bounds.marCap.min, bounds.marCap.max),
                divYld: normalize(item.divYld, bounds.divYld.min, bounds.divYld.max),
                roce: normalize(item.roce, bounds.roce.min, bounds.roce.max),
                qtrProfitVar: normalize(item.qtrProfitVar, bounds.qtrProfitVar.min, bounds.qtrProfitVar.max),
                qtrSalesVar: normalize(item.qtrSalesVar, bounds.qtrSalesVar.min, bounds.qtrSalesVar.max),
                roce3Yr: normalize(item.roce3Yr, bounds.roce3Yr.min, bounds.roce3Yr.max),
                profitVar3Yrs: normalize(item.profitVar3Yrs, bounds.profitVar3Yrs.min, bounds.profitVar3Yrs.max),
                salesVar3Yrs: normalize(item.salesVar3Yrs, bounds.salesVar3Yrs.min, bounds.salesVar3Yrs.max),
            }
        };
    });
}

function rankStocks(normalizedData) {
    const ranked = normalizedData.map(item => {
        const score =
            (item.norm.roce * 0.15) +
            (item.norm.roce3Yr * 0.15) +
            (item.norm.qtrProfitVar * 0.10) +
            (item.norm.qtrSalesVar * 0.10) +
            (item.norm.profitVar3Yrs * 0.10) +
            (item.norm.salesVar3Yrs * 0.10) +
            (item.norm.divYld * 0.05) +
            (item.norm.marCap * 0.05) +
            (item.norm.invertedPe * 0.20);

        return { ...item, score };
    });

    return ranked.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getTop10Stocks() {
    let allData = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const html = await fetchScreenerPage(page);
        if (!html) break;

        const data = parseScreenerData(html);
        if (data.length === 0) {
            hasNextPage = false;
            break;
        }

        allData = allData.concat(data);

        // Check if next page exists by looking for the "Next" button in pagination
        const $ = cheerio.load(html);
        const nextBtn = $('a[hx-get*="page="]').filter((i, el) => $(el).text().trim() === 'Next');
        if (nextBtn.length === 0) {
            hasNextPage = false;
        } else {
            page++;
            // Sleep slightly to respect rate limits
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    const normalized = normalizeData(allData);
    return rankStocks(normalized);
}

async function getCurrentPrice(stockCode) {
    const userAgent = new UserAgent();
    try {
        const response = await axios.get(`${BASE_URL}/company/${stockCode}/`, {
            headers: {
                'User-Agent': userAgent.toString(),
                'Accept': 'text/html,application/xhtml+xml',
            }
        });

        const $ = cheerio.load(response.data);
        const priceText = $('#top-ratios li:contains("Current Price") .number').text().replace(/,/g, '');
        const price = parseFloat(priceText);

        return isNaN(price) ? null : price;
    } catch (error) {
        console.error(`Error fetching current price for ${stockCode}:`, error.message);
        return null;
    }
}

export {
    fetchScreenerPage,
    parseScreenerData,
    normalizeData,
    rankStocks,
    getTop10Stocks,
    getCurrentPrice
};

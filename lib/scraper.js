import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

const BASE_URL = 'https://www.screener.in';

async function fetchScreenerPage(screenerUrl, page = 1) {
    const userAgent = new UserAgent();
    try {
        const response = await axios.get(`${screenerUrl}&page=${page}`, {
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

    const headers = [];
    $('table.data-table thead th').each((i, th) => {
        headers.push($(th).text().trim().toUpperCase());
    });

    const cmpIndex = headers.findIndex(h => h.includes('CMP') || h.includes('PRICE') || h.includes('CURRENT'));
    const peIndex = headers.findIndex(h => h.includes('P/E') || h.includes('PE'));
    const marCapIndex = headers.findIndex(h => h.includes('MAR CAP') || h.includes('MARKET CAP'));
    const divYldIndex = headers.findIndex(h => h.includes('DIV YLD') || h.includes('DIVIDEND'));
    const roceIndex = headers.findIndex(h => h.includes('ROCE') && !h.includes('3YR'));
    const qtrProfitVarIndex = headers.findIndex(h => h.includes('QTR PROFIT VAR'));
    const qtrSalesVarIndex = headers.findIndex(h => h.includes('QTR SALES VAR'));
    const roce3YrIndex = headers.findIndex(h => h.includes('ROCE 3YR'));
    const profitVar3YrsIndex = headers.findIndex(h => h.includes('PROFIT VAR 3YRS'));
    const salesVar3YrsIndex = headers.findIndex(h => h.includes('SALES VAR 3YRS'));

    rows.each((i, row) => {
        const cols = $(row).find('td');
        if (cols.length > 0) {
            const stockLink = $(cols[1]).find('a').attr('href');
            const stockCode = stockLink ? stockLink.split('/').filter(p => p && p !== 'company' && p !== 'consolidated')[0] : null;
            const companyName = $(cols[1]).find('a').text().trim();

            const parseNumber = (index) => {
                if (index === -1) return 0;
                const text = $(cols[index]).text();
                if (!text) return 0;
                const val = parseFloat(text.replace(/,/g, ''));
                return isNaN(val) ? 0 : val;
            };

            if (!stockCode) return; // skip if no link found

            data.push({
                stockCode,
                companyName,
                cmp: cmpIndex !== -1 ? parseNumber(cmpIndex) : 0,
                pe: parseNumber(peIndex),
                marCap: parseNumber(marCapIndex),
                divYld: parseNumber(divYldIndex),
                roce: parseNumber(roceIndex),
                qtrProfitVar: parseNumber(qtrProfitVarIndex),
                qtrSalesVar: parseNumber(qtrSalesVarIndex),
                roce3Yr: parseNumber(roce3YrIndex),
                profitVar3Yrs: parseNumber(profitVar3YrsIndex),
                salesVar3Yrs: parseNumber(salesVar3YrsIndex),
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

function rankStocks(normalizedData, weights) {
    const ranked = normalizedData.map(item => {
        const score =
            (item.norm.roce * (weights?.wRoce ?? 0.15)) +
            (item.norm.roce3Yr * (weights?.wRoce3Yr ?? 0.15)) +
            (item.norm.qtrProfitVar * (weights?.wQtrProfitVar ?? 0.10)) +
            (item.norm.qtrSalesVar * (weights?.wQtrSalesVar ?? 0.10)) +
            (item.norm.profitVar3Yrs * (weights?.wProfitVar3Yrs ?? 0.10)) +
            (item.norm.salesVar3Yrs * (weights?.wSalesVar3Yrs ?? 0.10)) +
            (item.norm.divYld * (weights?.wDivYld ?? 0.05)) +
            (item.norm.marCap * (weights?.wMarCap ?? 0.05)) +
            (item.norm.invertedPe * (weights?.wInvertedPe ?? 0.20));

        return { ...item, score };
    });

    return ranked.sort((a, b) => b.score - a.score).slice(0, 10);
}

async function getTop10Stocks(screenerUrl, weights) {
    let allData = [];
    let page = 1;
    let hasNextPage = true;

    // Ensure URL has a ? before appending &page=
    const separator = screenerUrl.includes('?') ? '&' : '?';

    while (hasNextPage) {
        let html;
        const urlWithPage = `${screenerUrl}${separator}page=${page}`;
        const userAgent = new UserAgent();
        try {
            const response = await axios.get(urlWithPage, {
                headers: {
                    'User-Agent': userAgent.toString(),
                    'Accept': 'text/html,application/xhtml+xml',
                }
            });
            html = response.data;
        } catch (error) {
            console.error(`Error fetching proxy page for ${screenerUrl} page ${page}:`, error.message);
            break;
        }

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
    return rankStocks(normalized, weights);
}

async function getCurrentPrice(stockCode) {
    const userAgent = new UserAgent();
    try {
        // Sleep to bypass rate limits (429 Too Many Requests)
        await new Promise(r => setTimeout(r, 600));

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

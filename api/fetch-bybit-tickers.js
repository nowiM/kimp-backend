const axios = require('axios');
const fetchUpbitTickers = require('./fetch-upbit-tickers.js');

async function fetchBybitTickers() {
    const url = 'https://api.bybit.com/v2/public/symbols';

    try {
        const upbitTickers = await fetchUpbitTickers();
        const response = await axios.get(url);
        const bybitTickers = response.data.result
            .filter((result) => result.name.endsWith("USDT"))
            .map((result) => result.name)
            .map((name) => name.split("USDT")[0]);

        return upbitTickers.filter(coinsName => bybitTickers.includes(coinsName));
    } catch (error) {
        console.error('Error fetching tickers:', error);
        return [];
    }
}

module.exports = fetchBybitTickers;

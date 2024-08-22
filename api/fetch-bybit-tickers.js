const axios = require('axios');
const fetchUpbitTickers = require('./fetch-upbit-tickers.js');

async function fetchBybitTickers() {
    const url = 'https://api.bybit.com/v2/public/symbols';

    try {
        const upbitTickers = await fetchUpbitTickers();
        const response = await axios.get(url);
        const bybitSymbols = response.data.result
            .filter((result) => result.name.endsWith("USDT"))
            .map((result) => result.name)
            .map((name) => name.split("USDT")[0]);
        

        // 업비트 심볼과 매칭되는 바이비트 심볼 필터링
        const matchingBybitTickers  = upbitTickers.filter(coinsName => bybitSymbols.includes(coinsName) && coinsName !== 'TON' && coinsName !== 'SHIB');
        matchingBybitTickers .push('SHIB1000'); //SHIB1000추가

        return matchingBybitTickers;
    } catch (error) {
        console.error('Error fetching tickers:', error);
        return [];
    }
}

module.exports = fetchBybitTickers;

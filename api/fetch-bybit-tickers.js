const axios = require('axios');
const fetchUpbitTickers = require('./fetch-upbit-tickers.js');

async function fetchBybitTickersV5() {
    const url = 'https://api.bybit.com/v5/market/instruments-info';

    try {
        const upbitTickers = await fetchUpbitTickers();

        // Bybit V5 API 요청
        const response = await axios.get(url, {
            params: { category: 'linear' }, // 선물 시장 (USDT 선물)
        });

        if (response.data.retMsg !== 'OK') {
            throw new Error(`Bybit API Error: ${response.data.retMsg}`);
        }

        // Bybit에서 USDT로 끝나는 심볼 가져오기
        const bybitSymbols = response.data.result.list
            .filter((instrument) => instrument.symbol.endsWith('USDT'))
            .map((instrument) => instrument.baseCoin);

        // Upbit 심볼과 매칭되는 Bybit 심볼 필터링
        const matchingBybitTickers = upbitTickers.filter(
            (coinName) =>
                bybitSymbols.includes(coinName) &&
                coinName !== 'TON' && // 제외할 심볼
                coinName !== 'SHIB'
        );

        matchingBybitTickers.push('SHIB1000'); // SHIB1000 추가

        return matchingBybitTickers;
    } catch (error) {
        console.error('Error fetching Bybit tickers:', error.message || error);
        return [];
    }
}

module.exports = fetchBybitTickersV5;

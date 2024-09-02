import React, { useEffect, useState } from 'react';

const TopArea = () => {
    const [marketData, setMarketData] = useState({ 
        totalKrwCoins: null, usdToKrwExchangeRate: null, 
        totalMarketCapUsd: null, marketCapChangePercent: null,
        totalVolume24hUsd: null, volumeChangePercent: null,
        btcDominance: null, ethDominance: null,
    });

    const fetchKrwCoinCount = async () => {
        const upbitUrl = 'http://localhost:8000/api/krwCoinCount';

        try {
            const response = await fetch(upbitUrl);
            const data = await response.json();
    
            const krwMarket = data.filter(coin => coin.market.startsWith('KRW'));

            setMarketData(prevState => ({
                ...prevState,
                totalKrwCoins: krwMarket.length
            }));
        } catch (error) {
            console.error("Failed to fetch Upbit data:", error);
        }
    };

    const fetchUsdToKrwExchangeRate = async () => {
        const exchangeRateUrl = 'http://localhost:8000/api/usdToKrwExchangeRate';
        
        try {
            const response = await fetch(exchangeRateUrl);
            const data = await response.json();

            setMarketData(prevState => ({
                ...prevState,
                usdToKrwExchangeRate: Math.floor(data.usd.krw * 100) / 100,
            }));
        } catch (error) {
            console.error("Failed to fetch exchange rate:", error);
        }
    };

    const fetchGlobalMarketData = async () => {
        const globalMetricsUrl = 'http://localhost:8000/api/globalMarketData';
        
        try {
            const response = await fetch(globalMetricsUrl);
            const data = await response.json();

            setMarketData(prevState => ({
                ...prevState,
                totalMarketCapUsd: data.data.quote.USD.total_market_cap, // 총 시가총액
                marketCapChangePercent: data.data.quote.USD.total_market_cap_yesterday_percentage_change, // 시간총액 변동율
                totalVolume24hUsd: data.data.quote.USD.total_volume_24h, // 총 거래량 
                volumeChangePercent: data.data.quote.USD.total_volume_24h_yesterday_percentage_change, // 거래량 변동율
                btcDominance: data.data.btc_dominance, // 비트코인 도미넌스
                ethDominance: data.data.eth_dominance, // 이더리움 도미넌스
            }));
        } catch (error) {
            console.error("Failed to fetch global market data:", error);
        }
    };

    useEffect(() => {
        fetchKrwCoinCount();
        fetchUsdToKrwExchangeRate();
        //fetchGlobalMarketData(); //API 요청 제한 때문에 주석 처리함
    }, []);

    return (
        <div className='topArea'>
            <h1>TopArea</h1>
            <span>코인: {marketData.totalKrwCoins !== null ? marketData.totalKrwCoins : 'Loading...'}</span>
            <span>환율: {marketData.usdToKrwExchangeRate !== null ? marketData.usdToKrwExchangeRate : 'Loading...'}</span>
            <span>
                시가총액: {marketData.totalMarketCapUsd !== null && marketData.usdToKrwExchangeRate !== null ? (marketData.totalMarketCapUsd * marketData.usdToKrwExchangeRate / 1000000000000).toFixed(1) : 'Loading...'}
                {marketData.marketCapChangePercent !== null ? Math.floor(marketData.marketCapChangePercent * 100) / 100 : 'Loading...'}
            </span>
            <span>
                24시간 거래량: {marketData.totalVolume24hUsd !== null && marketData.usdToKrwExchangeRate !== null ? (marketData.totalVolume24hUsd * marketData.usdToKrwExchangeRate / 1000000000000).toFixed(2) : 'Loading...'}
                {marketData.volumeChangePercent !== null ? Math.floor(marketData.volumeChangePercent * 100) / 100 : 'Loading...'}
            </span>
            <span>도미넌스 BTC: {marketData.btcDominance !== null ? Math.floor(marketData.btcDominance * 100) / 100 : 'Loading...'}</span>
            <span>ETH: {marketData.ethDominance !== null ? Math.floor(marketData.ethDominance * 100) / 100 : 'Loading...'}</span>
        </div>
    );
}

export default TopArea;

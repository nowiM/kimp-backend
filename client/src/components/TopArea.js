import React, { useEffect, useState } from 'react';

const TopArea = () => {
    const [dominance, setDominance] = useState({ 
        btc_d: null, eth_d: null, coinCount: null,
    });

    const getCoinCount = async () => {
        const upbitUrl = 'https://api.upbit.com/v1/market/all'

        try{
            const response = await fetch(upbitUrl);
            const data = await response.json();
    
            const krwMarket = data.filter(coin => coin.market.startsWith('KRW'));

            setDominance(prevState => ({
                ...prevState,
                coinCount: krwMarket.length
            }));
        } catch(error) {
            console.error("Failed to fetch upbit data:", error);
        }
        

    }

    const getDominace = async () => {
        const dominaceUrl = 'https://api.coinlore.net/api/global/';

        try {
            const response = await fetch(dominaceUrl);
            const data = await response.json();
            setDominance(prevState => ({
                ...prevState,
                btc_d: data[0].btc_d,
                eth_d: data[0].eth_d
            }));
        } catch (error) {
            console.error("Failed to fetch dominance data:", error);
        }
    }

    useEffect(() => {
        getCoinCount();
        getDominace();
    }, []);

    return (
        <div>
            <h1>TopArea</h1>
            <span>코인: {dominance.coinCount !== null ? dominance.coinCount : 'Loading...'}</span>
            <span>BTC: {dominance.btc_d !== null ? dominance.btc_d : 'Loading...'}</span>
            <span>ETH: {dominance.eth_d !== null ? dominance.eth_d : 'Loading...'}</span>
        </div>
    );
}

export default TopArea;

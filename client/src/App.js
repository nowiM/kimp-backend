import React, { useEffect, useState } from 'react';
import CoinTable from './components/CoinTable';
import CoinDetail from './components/CoinDetail'; // Import the new CoinDetail component
import TopArea from './components/TopArea'; 
import './index.css';

function App() {
  const [coinData, setCoinData] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTC'); // Default to Bitcoin

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8000`);
    ws.onopen = () => console.log("서버와 WebSocket 연결 성공");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.source === "initial") {
          setExchangeRate(message.exchangeRate);
          
          const { upbit, bybit } = message.data;
          const formattedData = {};

          for (const ticker in upbit) {
            const upbitData = upbit[ticker];
            const bybitData = bybit[ticker] || { price: null };
            formattedData[ticker] = {
              ticker: ticker,
              upbitPrice: upbitData.price,
              bybitPrice: bybitData.price,
              signedChangeRate: upbitData.signedChangeRate,
              lowest_52_week_price: upbitData.lowest_52_week_price,
              acc_trade_price_24h: upbitData.acc_trade_price_24h,
            };
          }

          setCoinData(formattedData);
          
        } else if (message.source === "exchangeRateUpdate") {
          setExchangeRate(message.exchangeRate);
        } else if (message.source === "upbit" || message.source === "bybit") {
          setCoinData(prevData => {
            const updatedData = { ...prevData };
            const { ticker } = message;
            if (!updatedData[ticker]) {
              updatedData[ticker] = { upbitPrice: null, bybitPrice: null };
            }
            if (message.source === "bybit") {
              updatedData[ticker].bybitPrice = message.price;
            } else if (message.source === "upbit") {
              updatedData[ticker].upbitPrice = message.price;
              updatedData[ticker].signedChangeRate = message.signedChangeRate;
              updatedData[ticker].acc_trade_price_24h = message.acc_trade_price_24h;
            }
            return updatedData;
          });
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    ws.onerror = (error) => console.error("WebSocket 오류:", error);
    ws.onclose = () => console.log("WebSocket 연결 종료");

    return () => {
      ws.close();
    };
  }, []);

  const handleCoinClick = (ticker) => {
    setSelectedCoin(ticker);
  };

  return (
    <div>
      <TopArea></TopArea>
      <CoinDetail 
        coin={selectedCoin} 
        data={coinData[selectedCoin]} 
        exchangeRate={exchangeRate} 
      />
      <h1>Real-time Upbit & Bybit Ticker Data</h1>
      <CoinTable 
        coinData={coinData} 
        exchangeRate={exchangeRate} 
        onCoinClick={handleCoinClick} // Pass the click handler
      />
    </div>
  );
}

export default App;

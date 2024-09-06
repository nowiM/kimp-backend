import React, { useEffect, useState } from 'react';
import TopArea from './components/topArea/TopArea'; 
import CoinFilterArea from './components/coinFilterArea/CoinFilterArea';
import CoinTable from './components/coinTable/CoinTable';
import ChatApp from './components/chatApp/ChatApp'; 
import './index.css';

function App() {
  const [coinData, setCoinData] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [sortedCoinData, setSortedCoinData] = useState([]);
  const [sortConfig, setSortConfig] = useState(() => {
    const savedConfig = localStorage.getItem('sortConfig');
    return savedConfig ? JSON.parse(savedConfig) : { key: 'acc_trade_price_24h', direction: 'desc' };
  });

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

  useEffect(() => {
    const sortedData = Object.keys(coinData)
      .map(ticker => ({ ticker, ...coinData[ticker] }))
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        if (direction === 'asc') {
          return a[key] > b[key] ? 1 : -1;
        } else {
          return a[key] < b[key] ? 1 : -1;
        }
      });
  
    // 상태가 동일한 경우 업데이트를 방지
    if (JSON.stringify(sortedData) !== JSON.stringify(sortedCoinData)) {
      setSortedCoinData(sortedData);
    }
  }, [coinData, sortConfig, sortedCoinData]);
  

  useEffect(() => {
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);

  const handleCoinClick = (ticker) => {
    setSelectedCoin(ticker);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className='mainContainer'>
      <div className='topArea'>
        <TopArea />
      </div>
      <div className='mainContent'>
        <div className='container'>
          <div className='coinInfo'>
            <CoinFilterArea 
              coin={selectedCoin} 
              data={coinData[selectedCoin]} 
              exchangeRate={exchangeRate} 
            />
            <CoinTable 
              coinData={sortedCoinData} 
              exchangeRate={exchangeRate} 
              onCoinClick={handleCoinClick} 
              onSort={handleSort} 
              sortConfig={sortConfig} 
            />
          </div>
          <div className='chatApp'>
            <ChatApp />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

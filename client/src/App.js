import React, { useEffect, useState } from 'react';
import TopArea from './components/topArea/TopArea'; 
import CoinFilterArea from './components/coinFilterArea/CoinFilterArea';
import CoinTable from './components/coinTable/CoinTable';
import ChatApp from './components/chatApp/ChatApp'; 

import updatePremium from './modules/updatePremium';
import './index.css';

function App() {
  const [coinData, setCoinData] = useState({});
  const [exchangeRate, setExchangeRate] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [sortedCoinData, setSortedCoinData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const [sortConfig, setSortConfig] = useState(() => {
    const savedConfig = localStorage.getItem('sortConfig');
    return savedConfig ? JSON.parse(savedConfig) : { key: 'acc_trade_price_24h', direction: 'desc' };
  });

  // WebSocket을 통해 데이터를 받아오는 로직
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
  
          setCoinData(formattedData); // 초기 데이터는 비교 없이 바로 설정
        } 
        // 환율 업데이트 처리
        else if (message.source === "exchangeRateUpdate") {
          setExchangeRate(message.exchangeRate);
        } 
        // 실시간 코인 가격 업데이트
        else if (message.source === "upbit" || message.source === "bybit") {
          const { ticker, price, signedChangeRate, acc_trade_price_24h } = message;
  
          setCoinData((prevData) => {
            const updatedData = { ...prevData };
  
            if (!updatedData[ticker]) {
              updatedData[ticker] = { upbitPrice: null, bybitPrice: null, signedChangeRate: null, acc_trade_price_24h: null };
            }
  
            if (message.source === "bybit") {
              updatedData[ticker].bybitPrice = price;
            } else if (message.source === "upbit") {
              updatedData[ticker].upbitPrice = price;
              updatedData[ticker].signedChangeRate = signedChangeRate;
              updatedData[ticker].acc_trade_price_24h = acc_trade_price_24h;
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
  
  

  // 코인 데이터를 정렬하는 로직
  useEffect(() => {
    const sortedData = Object.keys(coinData)
      .map(ticker => ({ ticker, ...coinData[ticker] }))
      .filter(coin => coin.ticker.toLowerCase().includes(searchTerm.toLowerCase())) // 검색어로 필터링
      .sort((a, b) => {
        const { key, direction } = sortConfig;

        // 김치 프리미엄 백분율에 대한 정렬을 추가
        if (key === 'premiumValue') {
          const aPremium = updatePremium(a.ticker, a, exchangeRate).premiumRate;
          const bPremium = updatePremium(b.ticker, b, exchangeRate).premiumRate;
          return direction === 'asc' ? aPremium - bPremium : bPremium - aPremium;
        }

        // 다른 필드에 대한 기본 정렬
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
  }, [coinData, sortConfig, sortedCoinData, searchTerm]); // 검색어 추가

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

  const handleSearch = (term) => {
    setSearchTerm(term); // 검색어 상태 업데이트
  };

  return (
    <div className='mainContainer'>
      <div className='topArea'>
        <TopArea />
      </div>
      <div className='mainContent'>
        <div className='container width1200 width990 width770 widthother'>
          <div className='coinInfo'>
            <CoinFilterArea 
              coin={selectedCoin} 
              data={coinData[selectedCoin]} 
              exchangeRate={exchangeRate}
              onSearch={handleSearch} // 검색 기능을 위한 props 전달
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

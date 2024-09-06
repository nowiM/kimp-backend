import React from 'react';
import formatUpbitPrice from '../../modules/formatUpbitPrice';
import formatRate from '../../modules/formatRate.js';
import updatePremium from '../../modules/updatePremium.js';

import './CoinFilterArea.css'

import upbitLogo from '../images/logo_upbit.svg';
import bybitLogo from '../images/logo_bybit.png';

const CoinFilterArea = ({ coin, data, exchangeRate }) => {
  if (!data) return null;

  const { premiumClass, premiumValue, premiumRate } = updatePremium(coin, data, exchangeRate);

  return (
    <div className="coinFilterArea">
      <div className="logoAndSearch">
        <div className="logo">
          <span className="exchange">업비트 KRW </span>
          <img className ="logoIma" src={upbitLogo} alt="upbit Logo" />
          <img className ="logoIma" src={bybitLogo} alt="bybit Logo" />
          <span className="exchange">바이비트 USDT마켓</span>
        </div>
        <div className="search">
          <div className="searchFild"></div>
        </div>
      </div>
      <div className="coins">
        <p>업비트 가격: {formatUpbitPrice(data.upbitPrice)}</p>
        <p>-</p>
        <p>바이비트 가격: {formatUpbitPrice(data.bybitPrice * exchangeRate)}</p>
        <p>=</p>
        <p>김치프리미엄: <span className={premiumClass}>{formatUpbitPrice(premiumValue)} ({formatRate(premiumRate)}%)</span></p>
      </div>
    </div>
  );
};

export default CoinFilterArea;

import React, {useState, useEffect} from 'react';
import formatUpbitPrice from '../../modules/formatUpbitPrice';
import formatRate from '../../modules/formatRate.js';
import updatePremium from '../../modules/updatePremium.js';

import './CoinFilterArea.css'

import upbitLogo from '../images/logo_upbit.svg';
import bybitLogo from '../images/logo_bybit.png';
import twoWayArrow from '../images/twoWayArrow.svg'

const CoinFilterArea = ({ coin, data, exchangeRate }) => {
  console.log(data)
  if (!data) return null;
  const { premiumClass, premiumValue, premiumRate } = updatePremium(coin, data, exchangeRate);

  return (
    <div className="coinFilterArea">
      <div className="logoAndSearch">
        <div className="logo">
          <div className="upbit" onClick={() => window.open('https://upbit.com/home', '_blank')}>
            <span className="exchange">업비트 KRW </span>
            <img className="logoIma" src={upbitLogo} alt="upbit Logo" />
          </div>

          <img className="twoWayArrowIcon" src={twoWayArrow} alt="twoWayArrow Icon" />

          <div className="bybit" onClick={() => window.open('https://www.bybit.com/en', '_blank')}>
            <img className="logoIma bybitBorder" src={bybitLogo} alt="bybit Logo" />
            <span className="exchange">바이비트 USDT마켓</span>
          </div>
        </div>
        <div className="search">
          <div className="searchFild"></div>
        </div>
      </div>
      <div className="coins">
        <img src= {`https://static.upbit.com/logos/${coin}.png`} alt="" />

        <div className="upbitPrice">
          업비트
          {formatUpbitPrice(data.upbitPrice)}
        </div>

        <div className="bybitPrice">
          바이비트
          {formatUpbitPrice(data.bybitPrice * exchangeRate)}
        </div>

        <div className="signedChangeRate">
          등락
          {data.signedChangeRate > 0 ? `+${formatRate(Math.floor(data.signedChangeRate * 10000) / 100)}%` : `${formatRate(Math.floor(data.signedChangeRate * 10000) / 100)}%`}
        </div>

        <div className="lowest52WeekPrice">
          52주 최저
        {formatUpbitPrice(data.lowest_52_week_price)}
        </div>

        <div className="accTradePrice">
          거래량
          {Math.floor(data.acc_trade_price_24h / 100000000)}억
        </div>
        <div className="kimpPremium">
          김프
          <span className={premiumClass}>{formatUpbitPrice(premiumValue)} ({formatRate(premiumRate)}%)</span>
        </div>
      </div>
    </div>
  );
};

export default CoinFilterArea;
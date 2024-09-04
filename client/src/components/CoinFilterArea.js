import React from 'react';
import formatUpbitPrice from '../modules/formatUpbitPrice.js';
import formatRate from '../modules/formatRate.js';
import updatePremium from '../modules/updatePremium.js';

const CoinFilterArea = ({ coin, data, exchangeRate }) => {
  if (!data) return null;

  const { premiumClass, premiumValue, premiumRate } = updatePremium(coin, data, exchangeRate);

  return (
    <div className="coinFilterArea">
        <p>업비트 가격: {formatUpbitPrice(data.upbitPrice)}</p>
        <p>-</p>
        <p>바이비트 가격: {formatUpbitPrice(data.bybitPrice * exchangeRate)}</p>
        <p>=</p>
        <p>김치프리미엄: <span className={premiumClass}>{formatUpbitPrice(premiumValue)} ({formatRate(premiumRate)}%)</span></p>
    </div>
  );
};

export default CoinFilterArea;

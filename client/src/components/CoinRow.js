import React from 'react';
import formatUpbitPrice from '../modules/formatUpbitPrice.js';
import formatBybitPrice from '../modules/formatBybitPrice.js';
import formatRate from '../modules/formatRate.js';

const CoinRow = ({ ticker, data, exchangeRate }) => {
  let premiumValue = '';
  let premiumRate = '';
  let premiumClass = '';

  if (data.upbitPrice !== null && data.bybitPrice !== null && exchangeRate !== null) {
    if (ticker === 'SHIB') {
      premiumValue = data.upbitPrice - data.bybitPrice; // 김프 금액
      premiumRate = (data.upbitPrice / data.bybitPrice) * 100 - 100; // 김프율
    } else {
      premiumValue = data.upbitPrice - (data.bybitPrice * exchangeRate);
      premiumRate = (data.upbitPrice / (data.bybitPrice * exchangeRate)) * 100 - 100; // 김프율
    }
    premiumClass = premiumRate > 0 ? "kimp" : "reverse";
  }

  const signedChangeClass = data.signedChangeRate > 0 ? "rise" : data.signedChangeRate < 0 ? "fall" : "even";

  return (
    <tr id={`coin-${ticker}`}>
      <td><img className="coinLogo" src={`https://static.upbit.com/logos/${ticker}.png`} alt={ticker} />{ticker}</td>
      <td id={`bybit-${ticker}`}>{formatBybitPrice(data.bybitPrice)}</td>
      <td id={`upbit-${ticker}`}>{formatUpbitPrice(data.upbitPrice)}</td>
      <td id={`signed-change-rate_${ticker}`} className={signedChangeClass}>
        {data.signedChangeRate > 0 ? `+${formatRate(Math.floor(data.signedChangeRate * 10000) / 100)}%` : `${formatRate(Math.floor(data.signedChangeRate * 10000) / 100)}%`}
      </td>
      <td id={`lowest_52_week_price_${ticker}`}>{formatUpbitPrice(data.lowest_52_week_price)}</td>
      <td id={`acc_trade_price_24h_${ticker}`}>{Math.floor(data.acc_trade_price_24h / 100000000)}억</td>
      <td id={`premium-${ticker}`} className={premiumClass}>
        {premiumValue !== '' && premiumRate !== '' ? `${formatUpbitPrice(premiumValue)} (${formatRate(premiumRate)}%)` : ''}
      </td>
    </tr>
  );
};

export default CoinRow;

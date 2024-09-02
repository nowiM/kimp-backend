import React from 'react';
import CoinRow from './CoinRow';

const CoinTable = ({ coinData, exchangeRate, onCoinClick, onSort, sortConfig }) => {
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
  };

  return (
    <div className="kimpTable">
      <div className="container">
        <table className="table">
          <thead className="tableHeader">
            <tr>
              <th onClick={() => onSort('ticker')}>코인 {getSortIndicator('ticker')}</th>
              <th onClick={() => onSort('bybitPrice')}>바이비트($) {getSortIndicator('bybitPrice')}</th>
              <th onClick={() => onSort('upbitPrice')}>업비트(￦) {getSortIndicator('upbitPrice')}</th>
              <th onClick={() => onSort('signedChangeRate')}>등락(%) {getSortIndicator('signedChangeRate')}</th>
              <th onClick={() => onSort('lowest_52_week_price')}>52주 최저 {getSortIndicator('lowest_52_week_price')}</th>
              <th onClick={() => onSort('acc_trade_price_24h')}>거래량(억) {getSortIndicator('acc_trade_price_24h')}</th>
              <th onClick={() => onSort('premiumValue')}>김치프리미엄(￦) {getSortIndicator('premiumValue')}</th>
            </tr>
          </thead>
          <tbody className="tableBody">
            {coinData.map(({ ticker, ...data }) => (
              <CoinRow 
                key={ticker} 
                ticker={ticker} 
                data={data} 
                exchangeRate={exchangeRate}
                onClick={() => onCoinClick(ticker)} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinTable;

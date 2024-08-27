import React from 'react';
import CoinRow from './CoinRow';

const CoinTable = ({ coinData, exchangeRate }) => {
  return (
    <div className="kimpTable">
      <div className="container">
        <table className="table">
          <thead className="tableHeader">
            <tr>
              <th>코인</th>
              <th>바이비트($)</th>
              <th>업비트(￦)</th>
              <th>등락(%)</th>
              <th>52주 최저</th>
              <th>거래량(억)</th>
              <th>김치프리미엄(￦)</th>
            </tr>
          </thead>
          <tbody className="tableBody">
            {Object.keys(coinData).map(ticker => (
              <CoinRow key={ticker} ticker={ticker} data={coinData[ticker]} exchangeRate={exchangeRate} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoinTable;

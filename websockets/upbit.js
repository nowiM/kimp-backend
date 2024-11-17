const WebSocket = require('ws');
const _ = require('lodash');
const reconnectWebSocket = require('./reconnectWebSocket')

function connectUpbit(coinData, tickers, io, retryCount = 0) {
  const upbitSocket = new WebSocket('wss://api.upbit.com/websocket/v1');

  const throttledEmit = _.throttle((ticker, upbitData) => {
      io.emit('upbit', { ticker, ...upbitData });
  }, 100);

  upbitSocket.on('open', () => {
      console.log('Connected to Upbit WebSocket');
      const message = [
          { ticket: 'unique_ticket' },
          { type: 'ticker', codes: tickers.map(ticker => `KRW-${ticker}`) }
      ];
      upbitSocket.send(JSON.stringify(message));
  });

  upbitSocket.on('message', (data) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const textData = buffer.toString('utf-8');
      try {
          const parsedData = JSON.parse(textData);
          if (parsedData.code) {
              const ticker = parsedData.code.split('-')[1];
              const upbitData = {
                  price: parsedData.trade_price,
                  signedChangeRate: parsedData.signed_change_rate,
                  lowest_52_week_price: parsedData.lowest_52_week_price,
                  acc_trade_price_24h: parsedData.acc_trade_price_24h,
              };
              coinData.upbit[ticker] = upbitData;
              throttledEmit(ticker, upbitData);
          }
      } catch (error) {
          console.error('Error parsing Upbit data:', error);
      }
  });

  upbitSocket.on('error', (error) => {
      console.error('Upbit WebSocket error:', error);
      reconnectWebSocket(() => connectUpbit(coinData, tickers, io, retryCount), retryCount, 5);
  });

  upbitSocket.on('close', () => {
      console.log('Upbit WebSocket closed');
      reconnectWebSocket(() => connectUpbit(coinData, tickers, io, retryCount), retryCount, 5);
  });

  return upbitSocket;
}

module.exports = connectUpbit;

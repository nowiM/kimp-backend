const WebSocket = require('ws');
const _ = require('lodash');
const reconnectWebSocket = require('./reconnectWebSocket')

function connectBybit(coinData, tickers, io, retryCount = 0) {
  const bybitSocket = new WebSocket('wss://stream.bybit.com/v5/public/linear');

  const throttledEmit = _.throttle((ticker, bybitData) => {
      io.emit('bybit', { ticker, ...bybitData });
  }, 100);

  bybitSocket.on('open', () => {
      console.log('Connected to Bybit WebSocket');
      const message = {
          op: "subscribe",
          args: tickers.map(ticker => `publicTrade.${ticker}USDT`)
      };
      bybitSocket.send(JSON.stringify(message));
  });

  bybitSocket.on('message', (data) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const textData = buffer.toString('utf-8');
      try {
          const parsedData = JSON.parse(textData);
          if (parsedData.topic && parsedData.data && parsedData.data.length > 0) {
              let ticker = parsedData.topic.split('.')[1];
              ticker = ticker.replace(/1000USDT$/, '').replace(/USDT$/, '');
              const bybitData = { price: parseFloat(parsedData.data[0].p) };
              coinData.bybit[ticker] = bybitData;
              throttledEmit(ticker, bybitData);
          }
      } catch (error) {
          console.error('Error parsing Bybit data:', error);
      }
  });

  bybitSocket.on('error', (error) => {
      console.error('Bybit WebSocket error:', error);
      reconnectWebSocket(() => connectBybit(coinData, tickers, io, retryCount), retryCount, 5);
  });

  bybitSocket.on('close', () => {
      console.log('Bybit WebSocket closed');
      reconnectWebSocket(() => connectBybit(coinData, tickers, io, retryCount), retryCount, 5);
  });

  return bybitSocket;
}

module.exports = connectBybit;

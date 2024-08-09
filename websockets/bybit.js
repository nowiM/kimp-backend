const WebSocket = require('ws');

function connectBybit(ws, tickers) {
  const bybitSocket = new WebSocket('wss://stream.bybit.com/v5/public/linear');

  bybitSocket.onopen = () => {
    console.log('Connected to Bybit WebSocket');
    const message = {
      op: "subscribe",
      args: tickers.map(ticker => `publicTrade.${ticker}USDT`)
    };
    bybitSocket.send(JSON.stringify(message));
  };

  bybitSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.topic && data.data && data.data.length > 0) {
        const ticker = data.topic.split('.')[1].replace('USDT', '');
        const bybitPrice = parseFloat(data.data[0].p);
        ws.send(JSON.stringify({ source: 'bybit', ticker, price: bybitPrice }));
      }
    } catch (error) {
      console.error('Error parsing Bybit data:', error);
    }
  };

  bybitSocket.onerror = (error) => {
    console.error('Bybit WebSocket error:', error);
  };

  bybitSocket.onclose = () => {
    console.log('Bybit WebSocket closed');
  };

  return bybitSocket;
}

module.exports = connectBybit;

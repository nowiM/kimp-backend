const WebSocket = require('ws');

function connectBybit(coinData, tickers, wss) {
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
        let ticker = data.topic.split('.')[1];
        
        // 'USDT' 또는 '1000USDT'를 제거하는 코드
        ticker = ticker.replace(/1000USDT$/, '').replace(/USDT$/, '');
        
        const bybitData = {
          price: parseFloat(data.data[0].p)
        };
        coinData.bybit[ticker] = bybitData;

        // 실시간으로 클라이언트에게 데이터 전송
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ source: 'bybit', ticker, ...bybitData }));
          }
        });
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

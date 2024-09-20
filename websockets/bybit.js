const WebSocket = require('ws');

function connectBybit(coinData, tickers, io) {
  const bybitSocket = new WebSocket('wss://stream.bybit.com/v5/public/linear');

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
        
        // 'USDT' 또는 '1000USDT'를 제거하는 코드
        ticker = ticker.replace(/1000USDT$/, '').replace(/USDT$/, '');
        
        const bybitData = {
          price: parseFloat(parsedData.data[0].p)
        };
        coinData.bybit[ticker] = bybitData;

        // 실시간으로 클라이언트에게 데이터 전송
        io.emit('bybit', { ticker, ...bybitData });
      }
    } catch (error) {
      console.error('Error parsing Bybit data:', error);
    }
  });

  bybitSocket.on('error', (error) => {
    console.error('Bybit WebSocket error:', error);
  });

  bybitSocket.on('close', () => {
    console.log('Bybit WebSocket closed');
  });

  return bybitSocket;
}

module.exports = connectBybit;

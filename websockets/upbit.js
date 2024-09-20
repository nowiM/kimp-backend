const WebSocket = require('ws');

function connectUpbit(coinData, tickers, io) {
  const upbitSocket = new WebSocket('wss://api.upbit.com/websocket/v1');

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
          price: parsedData.trade_price, // 업비트 코인의 가격
          signedChangeRate: parsedData.signed_change_rate, // 부호가 있는 변화율
          lowest_52_week_price: parsedData.lowest_52_week_price, // 52주 최저값
          acc_trade_price_24h: parsedData.acc_trade_price_24h // 24시간 누적 거래대금	
        };
        coinData.upbit[ticker] = upbitData;
        
        // 실시간으로 클라이언트에게 데이터 전송
        io.emit('upbit', { ticker, ...upbitData });
      }
    } catch (error) {
      console.error('Error parsing Upbit data:', error);
    }
  });

  upbitSocket.on('error', (error) => {
    console.error('Upbit WebSocket error:', error);
  });

  upbitSocket.on('close', () => {
    console.log('Upbit WebSocket closed');
  });

  return upbitSocket;
}

module.exports = connectUpbit;

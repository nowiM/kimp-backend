const WebSocket = require('ws');

function connectUpbit(coinData, tickers, wss) {
  const upbitSocket = new WebSocket('wss://api.upbit.com/websocket/v1');

  upbitSocket.onopen = () => {
    console.log('Connected to Upbit WebSocket');
    const message = [
      { ticket: 'unique_ticket' },
      { type: 'ticker', codes: tickers.map(ticker => `KRW-${ticker}`) }
    ];
    upbitSocket.send(JSON.stringify(message));
  };

  upbitSocket.onmessage = (event) => {
    const buffer = Buffer.from(event.data);
    const textData = buffer.toString('utf-8');
    try {
      const data = JSON.parse(textData);
      if (data.code) {
        const ticker = data.code.split('-')[1];
        const upbitData = {
          price: data.trade_price, // 업비트 코인의 가격
          signedChangeRate: data.signed_change_rate, // 부호가 있는 변화율
          lowest_52_week_price: data.lowest_52_week_price, // 52주 최저값
          acc_trade_price_24h: data.acc_trade_price_24h // 24시간 누적 거래대금	
        };
        coinData.upbit[ticker] = upbitData;
        
        // 실시간으로 클라이언트에게 데이터 전송
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ source: 'upbit', ticker, ...upbitData }));
          }
        });
      }
    } catch (error) {
      console.error('Error parsing Upbit data:', error);
    }
  };

  upbitSocket.onerror = (error) => {
    console.error('Upbit WebSocket error:', error);
  };

  upbitSocket.onclose = () => {
    console.log('Upbit WebSocket closed');
  };

  return upbitSocket;
}

module.exports = connectUpbit;

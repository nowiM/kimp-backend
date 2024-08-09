const WebSocket = require('ws');

function connectUpbit(ws, tickers) {
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
        const upbitPrice = data.trade_price;
        const upbitSignedChangeRate = data.signed_change_rate; //부호가 있는 변화율
        const upbitLowest_52_Week_price = data.lowest_52_week_price; //52주 신저가
        const upbit_acc_trade_price_24 = data.acc_trade_price_24h; // 24시간 누적 거래량
        ws.send(JSON.stringify({ source: 'upbit', ticker, price: upbitPrice, signedChangeRate: upbitSignedChangeRate, lowest_52_week_price: upbitLowest_52_Week_price, acc_trade_price_24h: upbit_acc_trade_price_24}));
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

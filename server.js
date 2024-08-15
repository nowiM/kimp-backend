const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const connectUpbit = require('./websockets/upbit');
const connectBybit = require('./websockets/bybit');
const fetchUpbitTickers = require('./api/fetch-upbit-tickers.js');
const fetchBybitTickers = require('./api/fetch-bybit-tickers.js');

const app = express();
const port = 8000;

app.use(express.static(path.join(__dirname, 'public')));

let exchangeRate = null;

const fetchExchangeRate = async () => {
  const exchangeRateUrl = "https://currency-api.pages.dev/v1/currencies/usd.json";
  try {
      const response = await fetch(exchangeRateUrl);
      const data = await response.json();
      exchangeRate = data.usd.krw;

      // 업데이트된 환율 값을 모든 클라이언트에 전송
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ source: 'exchangeRateUpdate', exchangeRate }));
        }
      });
  } catch (error) {
      console.log("Error!! fetchExchangeRate function ->", error);
      return;
  }
};

// 서버 시작 시 최초로 환율을 가져오고, 이후 6시간마다 갱신
fetchExchangeRate();

setInterval(fetchExchangeRate, (6 * 60 * 60 * 1000) + (5 * 1000)); // 6시간 5초마다 실행

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

// 각 거래소에서 받은 데이터를 저장할 객체
const coinData = {
  upbit: {},
  bybit: {}
};

// 서버 시작 시 업비트와 바이비트 웹소켓 연결을 시작하여 지속적으로 데이터 수집
(async () => {
  const upbitTickers = await fetchUpbitTickers();
  const bybitTickers = await fetchBybitTickers();

  connectUpbit(coinData, upbitTickers, wss);
  connectBybit(coinData, bybitTickers, wss);
})();

wss.on('connection', (ws) => {
  console.log('Client connected');

  // 클라이언트가 연결될 때 서버에서 수집된 최신 데이터를 클라이언트에 전달
  ws.send(JSON.stringify({
    source: 'initial',
    data: coinData,
    exchangeRate
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

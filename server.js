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
    data: coinData
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

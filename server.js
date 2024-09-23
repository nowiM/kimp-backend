const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http'); // http 서버 생성
const { Server } = require('socket.io'); // socket.io 서버 생성

// 업비트, 바이비트, 환율 관련 모듈 불러오기
const connectUpbit = require('./websockets/upbit.js');
const connectBybit = require('./websockets/bybit.js');
const fetchUpbitTickers = require('./api/fetch-upbit-tickers.js');
const fetchBybitTickers = require('./api/fetch-bybit-tickers.js');
const { fetchExchangeRate, updateExchangeRate } = require('./api/fetch-exchangeRate.js');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); //환경변수 불러오기
}

const app = express(); // express 앱 생성
const PORT = process.env.PORT; // 포트 설정 (환경 변수 또는 기본값 8000)

// 미들웨어 설정
app.use(helmet()); // 보안 강화
app.use(cors({
  origin: 'https://web-kimp-frontend-m1ek7q6w89a39f99.sel4.cloudtype.app/',
  methods: ['GET', 'POST'],
})); // CORS 설정

// MongoDB 연결
mongoose.connect(process.env.DB).then(() => console.log('connected to database'));

// CORS 허용
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// 업비트 KRW 코인 카운트 API
app.get('/api/krwCoinCount', async (req, res) => {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all');
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '/api/krwCoinCount Failed to fetch data' });
  }
});

// USD-KRW 환율 API
app.get('/api/usdToKrwExchangeRate', async (req, res) => {
  try {
    const response = await fetch('https://currency-api.pages.dev/v1/currencies/usd.json');
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '/api/usdToKrwExchangeRate Failed to fetch data' });
  }
});

// http 서버와 Socket.io 서버를 통합하여 생성
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://web-kimp-frontend-m1ek7q6w89a39f99.sel4.cloudtype.app/', // 클라이언트 주소에 맞춰서 수정
    methods: ['GET', 'POST'],
  },
});

// WebSocket 서버 로직을 Socket.io로 대체
let exchangeRate = null;
const coinData = {
  upbit: {},
  bybit: {},
};

// 환율 가져오기 및 주기적 업데이트
(async () => {
  exchangeRate = await fetchExchangeRate();
  setInterval(() => updateExchangeRate(io), (6 * 60 * 60 * 1000) + (5 * 1000)); // 6시간마다 환율 갱신
})();

// 업비트, 바이비트 웹소켓 연결 (Socket.io 사용)
(async () => {
  const upbitTickers = await fetchUpbitTickers();
  const bybitTickers = await fetchBybitTickers();

  connectUpbit(coinData, upbitTickers, io);
  connectBybit(coinData, bybitTickers, io);
})();

// Socket.io 클라이언트 연결 처리
io.on('connection', (socket) => {
  console.log('Client connected');

  // 최초 데이터 전송
  const sortedData = Object.keys(coinData.upbit)
    .map(ticker => ({
      ticker,
      upbit: coinData.upbit[ticker],
      bybit: coinData.bybit[ticker] || null,
    }))
    .sort((a, b) => (b.upbit.acc_trade_price_24h || 0) - (a.upbit.acc_trade_price_24h || 0));

  const sortedCoinData = {
    upbit: {},
    bybit: {},
  };

  sortedData.forEach(({ ticker, upbit, bybit }) => {
    sortedCoinData.upbit[ticker] = upbit;
    sortedCoinData.bybit[ticker] = bybit;
  });

  socket.emit('initial', {
    source: 'initial',
    data: sortedCoinData,
    exchangeRate,
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Socket.io를 활용한 채팅 기능 처리
require('./utils/io.js')(io); // io를 인자로 넘겨준다.

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http'); // http 서버 생성
const { Server } = require('socket.io'); // socket.io 서버 생성
const sharp = require('sharp'); // 이미지 최적화
const axios = require('axios'); // HTTP 요청 라이브러리

// 업비트, 바이비트, 환율 관련 모듈 불러오기
const connectUpbit = require('./websockets/upbit.js');
const connectBybit = require('./websockets/bybit.js');
const fetchUpbitTickers = require('./api/fetch-upbit-tickers.js');
const fetchBybitTickers = require('./api/fetch-bybit-tickers.js');
const { fetchExchangeRate, updateExchangeRate } = require('./api/fetch-exchangeRate.js');

const app = express(); // express 앱 생성
const PORT = process.env.PORT; // 포트 설정 (환경 변수 또는 기본값 8000)

// 미들웨어 설정
app.use(helmet()); // 보안 강화
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
})); // CORS 설정

// MongoDB 연결
mongoose.connect(process.env.DB).then(() => console.log('connected to database'));

// 원화마켓 코인의 개수 API
app.get('/api/krwCoinCount', async (req, res) => {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '/api/krwCoinCount Failed to fetch data' });
  }
});

// CoinMarketCap 글로벌 데이터 API(요청 제한 때문에 주석 처리함)
app.get('/api/globalMarketData', async (req, res) => {
  try {
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '/api/globalMarketData Failed to fetch data' });
  }
});

// 이미지 프록시 서버 (이미지 최적화)
// app.get('/optimized-logo/:ticker', async (req, res) => {
//   const { ticker } = req.params;
//   const imageUrl = `https://static.upbit.com/logos/${ticker}.png`;

//   try {
//     const response = await axios({ url: imageUrl, responseType: 'arraybuffer' });
//     const optimizedImage = await sharp(response.data)
//       .resize(50, 50)
//       .webp({ quality: 70 })
//       .toBuffer();
    
//     // CORS 헤더 추가
//     res.set('Access-Control-Allow-Origin', process.env.CLIENT_URL); // 허용된 클라이언트 URL
//     res.set('Access-Control-Allow-Methods', 'GET'); // 허용된 메서드
//     res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // 리소스를 cross-origin에서 허용

//     res.set('Content-Type', 'image/webp');
//     res.send(optimizedImage);
//   } catch (error) {
//     console.error(`[ERROR] Failed to process image for ticker: ${ticker}`, error.message);
//     res.status(500).send('Image optimization failed');
//   }
// });


// http 서버와 Socket.io 서버를 통합하여 생성
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// 환율 가져오기 및 주기적 업데이트
let exchangeRate = {value: null};
const coinData = {
  upbit: {},
  bybit: {},
};

(async () => {
  exchangeRate.value = await fetchExchangeRate();
  setInterval(() => updateExchangeRate(io, exchangeRate), 3 * 60 * 1000); //3분마다 업데이트
})();

// 업비트, 바이비트 웹소켓 연결 (Socket.io 사용)
(async () => {
  const upbitTickers = await fetchUpbitTickers();
  const bybitTickers = await fetchBybitTickers();
  connectUpbit(coinData, upbitTickers, io);
  connectBybit(coinData, bybitTickers, io);
})();

// Socket.io를 활용한 암호화폐 데이터 처리
require('./utils/crypto-io.js')(io, coinData, exchangeRate);

// Socket.io를 활용한 채팅 기능 처리
require('./utils/chatting-io.js')(io); // io를 인자로 넘겨준다.

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
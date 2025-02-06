const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http'); // http 서버 생성
const { Server } = require('socket.io'); // socket.io 서버 생성
const axios = require('axios'); // HTTP 요청 라이브러리
const fs = require('fs'); // 파일 시스템 모듈
const path = require('path'); // 경로 모듈
const sharp = require('sharp'); // ✅ 이미지 최적화 라이브러리 추가

// 업비트, 바이비트, 환율 관련 모듈 불러오기
const connectUpbit = require('./websockets/upbit.js');
const connectBybit = require('./websockets/bybit.js');
const fetchUpbitTickers = require('./api/fetch-upbit-tickers.js');
const fetchBybitTickers = require('./api/fetch-bybit-tickers.js');
const { fetchExchangeRate, updateExchangeRate } = require('./api/fetch-exchangeRate.js');

const app = express(); // express 앱 생성
const PORT = process.env.PORT || 8000; // 기본값 8000

// ✅ 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: '*', // ✅ 모든 도메인에서 접근 가능하도록 설정 (필요 시 제한 가능)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ MongoDB 연결
mongoose.connect(process.env.DB).then(() => console.log('connected to database'));

// ✅ 이미지 캐싱 디렉토리 설정
const IMAGE_CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(IMAGE_CACHE_DIR)) {
    fs.mkdirSync(IMAGE_CACHE_DIR);
}

// ✅ 정적 파일 제공 (최적화된 WebP 제공)
app.use('/cache', express.static(IMAGE_CACHE_DIR, {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // CORS 해결
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
    }
}));

// ✅ 업비트 코인 로고 API (이미지 최적화 & 캐싱)
app.get('/logo/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const imagePath = path.join(IMAGE_CACHE_DIR, `${ticker}.webp`); // ✅ WebP 파일로 저장

    try {
        // ✅ 캐싱된 파일이 있으면 바로 제공
        if (fs.existsSync(imagePath)) {
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
            return res.sendFile(imagePath);
        }

        // ✅ 업비트에서 PNG 이미지 가져오기
        const imageUrl = `https://static.upbit.com/logos/${ticker}.png`;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // ✅ 이미지 최적화 (WebP로 변환 + 크기 줄이기)
        const optimizedImage = await sharp(response.data)
            .resize(64, 64) // ✅ 크기를 64x64로 줄임
            .webp({ quality: 80 }) // ✅ WebP 변환 (품질 80%)
            .toBuffer();

        // ✅ WebP 이미지 저장
        fs.writeFileSync(imagePath, optimizedImage);
        console.log(`Optimized logo for ${ticker} saved successfully`);

        // ✅ WebP 이미지 제공
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.send(optimizedImage);
    } catch (error) {
        // console.error(`Failed to fetch logo for ${ticker}:`, error.message);
        res.status(500).json({ error: `Failed to fetch logo for ${ticker}` });
    }
});

// ✅ 원화마켓 코인의 개수 API
app.get('/api/krwCoinCount', async (req, res) => {
  try {
    const response = await fetch('https://api.upbit.com/v1/market/all');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '/api/krwCoinCount Failed to fetch data' });
  }
});

// ✅ CoinMarketCap 글로벌 데이터 API (요청 제한 있음)
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

// ✅ http 서버와 Socket.io 서버를 통합하여 생성
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // ✅ CORS 문제 해결
    methods: ['GET', 'POST'],
  },
});

// ✅ 환율 가져오기 및 주기적 업데이트
let exchangeRate = { value: null };
const coinData = {
  upbit: {},
  bybit: {},
};

(async () => {
  exchangeRate.value = await fetchExchangeRate();
  setInterval(() => updateExchangeRate(io, exchangeRate), 3 * 60 * 1000); // 3분마다 업데이트
})();

// ✅ 업비트, 바이비트 웹소켓 연결 (Socket.io 사용)
(async () => {
  const upbitTickers = await fetchUpbitTickers();
  const bybitTickers = await fetchBybitTickers();
  connectUpbit(coinData, upbitTickers, io);
  connectBybit(coinData, bybitTickers, io);
})();

// ✅ Socket.io를 활용한 암호화폐 데이터 처리
require('./utils/crypto-io.js')(io, coinData, exchangeRate);

// ✅ Socket.io를 활용한 채팅 기능 처리
require('./utils/chatting-io.js')(io); // io를 인자로 넘겨준다.

// ✅ 서버 시작
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

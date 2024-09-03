const express = require('express');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config(); // env(환경변수) 파일을 불러오기 위함 =>process.env.키값

const connectUpbit = require('./websockets/upbit.js');
const connectBybit = require('./websockets/bybit.js');

const fetchUpbitTickers = require('./api/fetch-upbit-tickers.js');
const fetchBybitTickers = require('./api/fetch-bybit-tickers.js');
const { fetchExchangeRate, updateExchangeRate } = require('./api/fetch-exchangeRate.js');

const app = express();
const port = 8000;

app.use(express.static(path.join(__dirname, 'client/build')));

let exchangeRate = null;

// CORS 허용
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// CoinMarketCap 글로벌 데이터 API
// app.get('/api/globalMarketData', async (req, res) => {
//   try {
//     const response = await fetch('https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest', {
//       method: 'GET',
//       headers: {
//         'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
//       },
//     });
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: '/api/globalMarketData Failed to fetch data' });
//   }
// });

// 업비트 KRW 코인 카운트 API
app.get('/api/krwCoinCount', async (req, res) => {
  try{
    const response = await fetch('https://api.upbit.com/v1/market/all');
    const data = await response.json();

    res.json(data);
  } catch(error) {
    res.status(500).json({ error: '/api/krwCoinCount Failed to fetch data' });
  }
});

// USD-KRW 환율 API
app.get('/api/usdToKrwExchangeRate', async (req, res) => {
  try {
    const response = await fetch('https://currency-api.pages.dev/v1/currencies/usd.json');
    const data = await response.json();

    res.json(data);
  } catch(error) {
    res.status(500).json({ error: '/api/usdToKrwExchangeRate Failed to fetch data' });
  }
})

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

// 서버 시작 시 최초로 환율을 가져오고, 이후 6시간마다 갱신
(async () => {
  exchangeRate = await fetchExchangeRate();
  setInterval(() => updateExchangeRate(wss), (6 * 60 * 60 * 1000) + (5 * 1000)); // 6시간 5초마다 실행
})();

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

  // 수집된 데이터를 거래대금 내림차순으로 정렬한다
  const sortedData = Object.keys(coinData.upbit)
    .map(ticker => ({
      ticker,
      upbit: coinData.upbit[ticker],
      bybit: coinData.bybit[ticker] || null
    }))
    .sort((a, b) => (b.upbit.acc_trade_price_24h || 0) - (a.upbit.acc_trade_price_24h || 0));

  // 클라이언트가 연결될 때 서버에서 수집된 최신 데이터를 정렬 후 클라이언트에 전달
  const sortedCoinData = {
    upbit: {},
    bybit: {}
  };

  sortedData.forEach(({ ticker, upbit, bybit }) => {
    sortedCoinData.upbit[ticker] = upbit;
    sortedCoinData.bybit[ticker] = bybit;
  });

  ws.send(JSON.stringify({
    source: 'initial',
    data: sortedCoinData,
    exchangeRate
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

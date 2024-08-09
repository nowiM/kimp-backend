const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const axios = require('axios');

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

wss.on('connection', async (ws) => {
  console.log('Client connected');

  const upbitTickers = await fetchUpbitTickers();
  const bybitTickers = await fetchBybitTickers();

  const upbitSocket = connectUpbit(ws, upbitTickers);
  const bybitSocket = connectBybit(ws, bybitTickers);

  ws.on('close', () => {
    console.log('Client disconnected');
    upbitSocket.close();
    bybitSocket.close();
  });
});


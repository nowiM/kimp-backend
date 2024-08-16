const WebSocket = require('ws');

const fetchExchangeRate = async () => {
  const exchangeRateUrl = "https://currency-api.pages.dev/v1/currencies/usd.json";
  let exchangeRate = null;
  try {
      const response = await fetch(exchangeRateUrl);
      const data = await response.json();
      exchangeRate = data.usd.krw;
  } catch (error) {
      console.log("Error!! fetchExchangeRate function ->", error);
  }
  return exchangeRate;
};

const updateExchangeRate = async (wss) => {
  const exchangeRate = await fetchExchangeRate();
  if (exchangeRate) {
    // 업데이트된 환율 값을 모든 클라이언트에 전송
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ source: 'exchangeRateUpdate', exchangeRate }));
      }
    });
  }
};

module.exports = { fetchExchangeRate, updateExchangeRate };

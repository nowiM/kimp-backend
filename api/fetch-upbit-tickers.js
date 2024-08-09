const axios = require('axios');

async function fetchUpbitTickers() {
  const url = 'https://api.upbit.com/v1/market/all';

  try {
    const response = await axios.get(url);

    return response.data
      .filter((market) => market.market.startsWith('KRW'))
      .map((market) => market.market)
      .map((market) => market.split('-')[1]);
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return [];
  }
}

module.exports = fetchUpbitTickers;

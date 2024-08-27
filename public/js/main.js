import { updatePremium } from './modules/updatePremium.js';
import { createCoinElement } from './modules/createCoinElement.js';
import { formatUpbitPrice } from './modules/formatUpbitPrice.js';
import { formatBybitPrice } from './modules/formatBybitPrice.js';
import { formatRate } from './modules/formatRate.js';

const ws = new WebSocket(`ws://${location.host}`);
let exchangeRate = null;
const coinData = {};

ws.onopen = () => console.log("서버와 WebSocket 연결 성공");

ws.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);

        if (message.source === "initial") {
            exchangeRate = message.exchangeRate;
            console.log('초기 달러 환율 1USD =>', exchangeRate);
            const { upbit, bybit } = message.data;

            for (const ticker in upbit) {
                const upbitData = upbit[ticker];
                const bybitData = bybit[ticker] || { price: null };

                coinData[ticker] = {
                    ticker: ticker,
                    upbitPrice: upbitData.price,
                    bybitPrice: bybitData.price,
                    signedChangeRate: upbitData.signedChangeRate,
                    lowest_52_week_price: upbitData.lowest_52_week_price,
                    acc_trade_price_24h: upbitData.acc_trade_price_24h,
                };

                createCoinElement(
                    ticker,
                    upbitData.price,
                    bybitData.price,
                    Math.floor(upbitData.signedChangeRate * 10000) / 100,
                    upbitData.lowest_52_week_price,
                    Math.floor(upbitData.acc_trade_price_24h / 100000000)
                );
                
                updatePremium(ticker, coinData, exchangeRate);
            }

        } else if (message.source === "exchangeRateUpdate") {
            exchangeRate = message.exchangeRate;
            console.log('새로운 달러 환율 1USD =>', exchangeRate);

            for (const ticker in coinData) {
                updatePremium(ticker, coinData, exchangeRate);
            }
        } else if (message.source === "upbit" || message.source === "bybit") {
            const { ticker } = message;

            if (!coinData[ticker]) {
                coinData[ticker] = { upbitPrice: null, bybitPrice: null };
                createCoinElement(ticker);
            }

            if (message.source === "bybit") {
                coinData[ticker].bybitPrice = message.price;
                document.getElementById(`bybit-${ticker}`).textContent = formatBybitPrice(message.price);
            } else if (message.source === "upbit") {
                coinData[ticker].upbitPrice = message.price;
                document.getElementById(`upbit-${ticker}`).textContent = formatUpbitPrice(message.price);

                const signedChangeClass = message.signedChangeRate > 0 ? "rise" : message.signedChangeRate < 0 ? "fall" : "even";
                document.querySelector(`#signed-change-rate_${ticker}`).className = signedChangeClass;
                document.getElementById(`signed-change-rate_${ticker}`).textContent = `${message.signedChangeRate > 0 ? "+" : ""}${formatRate(Math.floor(message.signedChangeRate * 10000) / 100)}%`;
                document.getElementById(`acc_trade_price_24h_${ticker}`).textContent =`${Math.floor(message.acc_trade_price_24h / 100000000)}억`
            }

            // 김프 업데이트
            updatePremium(ticker, coinData, exchangeRate);
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
};

ws.onerror = (error) => console.error("WebSocket 오류:", error);
ws.onclose = () => console.log("WebSocket 연결 종료");

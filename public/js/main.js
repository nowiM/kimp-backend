import { updatePremium } from './modules/updatePremium.js';
import { createCoinElement } from './modules/createCoinElement.js'

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
                    upbitPrice: upbitData.price,
                    bybitPrice: bybitData.price,
                    signedChangeRate: upbitData.signedChangeRate,
                    lowest_52_week_price: upbitData.lowest_52_week_price,
                    acc_trade_price_24h: upbitData.acc_trade_price_24h,
                };
                createCoinElement(
                    ticker,
                    upbitData.price.toLocaleString(),
                    bybitData.price ? bybitData.price.toLocaleString() : "",
                    (upbitData.signedChangeRate * 100).toFixed(2),
                    upbitData.lowest_52_week_price.toLocaleString(),
                    (upbitData.acc_trade_price_24h / 100000000).toFixed(0)
                );

                const signedChangeClass = upbitData.signedChangeRate > 0 ? "rise" : upbitData.signedChangeRate < 0 ? "fall" : "even";
                document.querySelector(`#signed-change-rate_${ticker}`).className = signedChangeClass;
                updatePremium(ticker, coinData, exchangeRate);
            }
        } else if (message.source === "exchangeRateUpdate") {
            exchangeRate = message.exchangeRate;
            console.log('새로운 달러 환율 1USD =>', exchangeRate);

            // 새로운 환율로 프리미엄 업데이트
            for (const ticker in coinData) {
                updatePremium(ticker, coinData, exchangeRate);
            }
        } else if (message.source === "upbit" || message.source === "bybit") {
            const { ticker } = message;

            if (!coinData[ticker]) {
                coinData[ticker] = { upbitPrice: null, bybitPrice: null };
                createCoinElement(ticker);
            }

            if (message.source === "upbit") {
                coinData[ticker].upbitPrice = message.price;
                document.getElementById(`upbit-${ticker}`).textContent = message.price.toLocaleString();

                const signedChangeClass = message.signedChangeRate > 0 ? "rise" : message.signedChangeRate < 0 ? "fall" : "even";
                document.querySelector(`#signed-change-rate_${ticker}`).className = signedChangeClass;
                document.getElementById(`signed-change-rate_${ticker}`).textContent = `${message.signedChangeRate > 0 ? "+" : ""}${(message.signedChangeRate * 100).toFixed(2)}%`;
            } else if (message.source === "bybit") {
                coinData[ticker].bybitPrice = message.price;
                document.getElementById(`bybit-${ticker}`).textContent = message.price.toLocaleString();
            }

            updatePremium(ticker, coinData, exchangeRate);
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
};

ws.onerror = (error) => console.error("WebSocket 오류:", error);
ws.onclose = () => console.log("WebSocket 연결 종료");
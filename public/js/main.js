const ws = new WebSocket(`ws://${location.host}`);
let exchangeRate = null;
const coinData = {};

function updatePremium(ticker) {
    if (coinData[ticker].upbitPrice !== null && coinData[ticker].bybitPrice !== null && exchangeRate !== null) {
        const premiumValue = coinData[ticker].upbitPrice - coinData[ticker].bybitPrice * exchangeRate; // 김프 금액
        const premiumRate = (coinData[ticker].upbitPrice / (coinData[ticker].bybitPrice * exchangeRate)) * 100 - 100; // 김프율

        const premiumText = (value, rate, digits) => `${value.toFixed(digits)} (${rate.toFixed(2)}%)`;
        const updateElement = (value, digits) => document.getElementById(`premium-${ticker}`).textContent = premiumText(value, premiumRate, digits);

        if (premiumRate > 0) {
            document.querySelector(`#premium-${ticker}`).className = "kimp";
            if (premiumValue >= 1000) updateElement(premiumValue, 0);
            else if (premiumValue >= 100) updateElement(premiumValue, 1);
            else if (premiumValue >= 10) updateElement(premiumValue, 2);
            else if (premiumValue >= 1) updateElement(premiumValue, 3);
            else updateElement(premiumValue, 4);
        } else {
            document.querySelector(`#premium-${ticker}`).className = "reverse";
            if (premiumValue <= -1000) updateElement(premiumValue, 0);
            else if (premiumValue <= -100) updateElement(premiumValue, 1);
            else if (premiumValue <= -10) updateElement(premiumValue, 2);
            else if (premiumValue <= -1) updateElement(premiumValue, 3);
            else updateElement(premiumValue, 4);
        }
    }
}

function createCoinElement(ticker, upbitPrice = "", bybitPrice = "", signedChangeRate = "", lowest_52_week_price = "", acc_trade_price_24h) {
    const tr = document.createElement("tr");
    tr.className = "coin";
    tr.id = `coin-${ticker}`;
    tr.innerHTML = `
        <td><img class="coinLogo" src="https://static.upbit.com/logos/${ticker}.png" alt="${ticker}" />${ticker}</td>
        <td id="upbit-${ticker}">${upbitPrice}</td>
        <td id="bybit-${ticker}">${bybitPrice}</td>
        <td id="signed-change-rate_${ticker}">${signedChangeRate > 0 ? `+${signedChangeRate}` : signedChangeRate}</td>
        <td id="lowest_52_week_price_${ticker}">${lowest_52_week_price}</td>
        <td id="acc_trade_price_24h_${ticker}">${acc_trade_price_24h}</td>
        <td id="premium-${ticker}"></td>`;
    document.querySelector(".tableBody").appendChild(tr);
}

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
                updatePremium(ticker);
            }
        } else if (message.source === "exchangeRateUpdate") {
            exchangeRate = message.exchangeRate;
            console.log('새로운 달러 환율 1USD =>', exchangeRate);

            // 새로운 환율로 프리미엄 업데이트
            for (const ticker in coinData) {
                updatePremium(ticker);
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

            updatePremium(ticker);
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
};

ws.onerror = (error) => console.error("WebSocket 오류:", error);
ws.onclose = () => console.log("WebSocket 연결 종료");
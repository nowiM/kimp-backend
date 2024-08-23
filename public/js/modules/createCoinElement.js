import { formatUpbitPrice } from './formatUpbitPrice.js';
import { formatBybitPrice } from './formatBybitPrice.js';
import { formatRate } from './formatRate.js';

export const createCoinElement = (
    ticker, 
    upbitPrice = "", 
    bybitPrice = "", 
    signedChangeRate = "", 
    lowest_52_week_price = "", 
    acc_trade_price_24h = ""
) => {
    const signedChangeClass = signedChangeRate > 0 ? "rise" : signedChangeRate < 0 ? "fall" : "even";
    const tr = document.createElement("tr");
    tr.className = "coin";
    tr.id = `coin-${ticker}`;
    tr.innerHTML = `
        <td><img class="coinLogo" src="https://static.upbit.com/logos/${ticker}.png" alt="${ticker}" />${ticker}</td>
        <td id="bybit-${ticker}">${formatBybitPrice(bybitPrice)}</td>
        <td id="upbit-${ticker}">${formatUpbitPrice(upbitPrice)}</td>
        <td id="signed-change-rate_${ticker}" class="${signedChangeClass}">${signedChangeRate > 0 ? `+${formatRate(signedChangeRate)}%` : `${formatRate(signedChangeRate)}%`}</td>
        <td id="lowest_52_week_price_${ticker}">${formatUpbitPrice(lowest_52_week_price)}</td>
        <td id="acc_trade_price_24h_${ticker}" data-order="${acc_trade_price_24h}">${Math.floor(acc_trade_price_24h / 100000000)}억</td>
        <td id="premium-${ticker}"></td>`;
    document.querySelector(".tableBody").appendChild(tr);
}

export const updateRowDataInTable = (ticker, data) => {
    const row = document.querySelector(`#coin-${ticker}`);
    if (row) {
        row.querySelector(`#bybit-${ticker}`).textContent = formatBybitPrice(data.bybitPrice);
        row.querySelector(`#upbit-${ticker}`).textContent = formatUpbitPrice(data.upbitPrice);
        row.querySelector(`#signed-change-rate_${ticker}`).textContent = `${data.signedChangeRate > 0 ? "+" : ""}${formatRate(data.signedChangeRate)}%`;
        row.querySelector(`#acc_trade_price_24h_${ticker}`).textContent = `${Math.floor(data.acc_trade_price_24h / 100000000)}억`;
        row.querySelector(`#acc_trade_price_24h_${ticker}`).setAttribute('data-order', data.acc_trade_price_24h);
    }
}

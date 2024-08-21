import { formatUpbitPrice } from './formatUpbitPrice.js';

export const updatePremium = (ticker, coinData, exchangeRate) => {
    if (coinData[ticker].upbitPrice !== null && coinData[ticker].bybitPrice !== null && exchangeRate !== null) {
        const premiumValue = coinData[ticker].upbitPrice - coinData[ticker].bybitPrice * exchangeRate; // 김프 금액
        const premiumRate = (coinData[ticker].upbitPrice / (coinData[ticker].bybitPrice * exchangeRate)) * 100 - 100; // 김프율

        const updateElement = (value, rate) => document.getElementById(`premium-${ticker}`).textContent = `${formatUpbitPrice(value)} (${Math.floor(rate * 100) / 100}%)`;

        if (premiumRate > 0) {
            document.querySelector(`#premium-${ticker}`).className = "kimp";
            updateElement(premiumValue, premiumRate);
        } else {
            document.querySelector(`#premium-${ticker}`).className = "reverse";
            updateElement(premiumValue, premiumRate);
        }
    }
}
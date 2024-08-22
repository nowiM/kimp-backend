import { formatUpbitPrice } from './formatUpbitPrice.js';
import { formatRate } from './formatRate.js';

export const updatePremium = (ticker, coinData, exchangeRate) => {
    if (coinData[ticker].upbitPrice !== null && coinData[ticker].bybitPrice !== null && exchangeRate !== null) {
        let premiumValue, premiumRate = 0;
        if(ticker === 'SHIB') {
            premiumValue = coinData[ticker].upbitPrice - coinData[ticker].bybitPrice; // 김프 금액
            premiumRate = coinData[ticker].upbitPrice / coinData[ticker].bybitPrice; // 김프율
        }
        else {
            premiumValue = coinData[ticker].upbitPrice - coinData[ticker].bybitPrice * exchangeRate; // 김프 금액
            premiumRate = (coinData[ticker].upbitPrice / (coinData[ticker].bybitPrice * exchangeRate)) * 100 - 100; // 김프율
        }

        const updateElement = (value, rate) => document.getElementById(`premium-${ticker}`).textContent = `${formatUpbitPrice(value)} (${formatRate(rate)}%)`;

        if (premiumRate > 0) {
            document.querySelector(`#premium-${ticker}`).className = "kimp";
            updateElement(premiumValue, premiumRate);
        } else {
            document.querySelector(`#premium-${ticker}`).className = "reverse";
            updateElement(premiumValue, premiumRate);
        }
    }
}

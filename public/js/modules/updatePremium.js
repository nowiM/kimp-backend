export const updatePremium = (ticker, coinData, exchangeRate) => {
    //console.log('upbit:', coinData[ticker].upbitPrice);
    //console.log('bybit:', coinData[ticker].bybitPrice);
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
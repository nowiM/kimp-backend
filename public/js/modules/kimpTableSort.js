import { updatePremium } from './updatePremium.js';
import { createCoinElement } from './createCoinElement.js'

// 정렬 및 테이블 렌더링 함수
export const renderTable = (sortDescending, coinData, exchangeRate, selectSort) => {
    console.log(selectSort);
    let valueA, valueB;
    const sortedTickers = Object.keys(coinData).sort((a, b) => {
        if(selectSort === 'ticker') {
            valueA = coinData[a].ticker.toUpperCase();
            valueB = coinData[b].ticker.toUpperCase();
            return sortDescending ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
        }
        else if(selectSort === 'upbitPrice' || selectSort === 'bybitPrice' || selectSort === 'signedChangeRate' || selectSort === 'lowest_52_week_price' || selectSort === 'acc_trade_price_24h') {
            valueA = coinData[a][selectSort] || 0;
            valueB = coinData[b][selectSort] || 0;
            return sortDescending ? valueB - valueA : valueA - valueB;
        }
        else if(selectSort === 'kimpSort') {
            valueA = (coinData[a].upbitPrice / (coinData[a].bybitPrice * exchangeRate)) * 100 - 100 || 0;
            valueB = (coinData[b].upbitPrice / (coinData[b].bybitPrice * exchangeRate)) * 100 - 100 || 0;
            return sortDescending ? valueB - valueA : valueA - valueB;
        }
    });

    // 기존 테이블 내용 삭제
    document.querySelector(".tableBody").innerHTML = "";

    // 정렬된 순서대로 테이블 생성
    for (const ticker of sortedTickers) {
        const data = coinData[ticker];
        createCoinElement(
            ticker,
            data.upbitPrice,
            data.bybitPrice,
            Math.floor(data.signedChangeRate * 10000) / 100,
            data.lowest_52_week_price,
            Math.floor(data.acc_trade_price_24h / 100000000)
        );
        updatePremium(ticker, coinData, exchangeRate);

        const signedChangeClass = data.signedChangeRate > 0 ? "rise" : data.signedChangeRate < 0 ? "fall" : "even";
        document.querySelector(`#signed-change-rate_${ticker}`).className = signedChangeClass;
    }
}
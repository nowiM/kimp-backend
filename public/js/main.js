import { updatePremium } from './modules/updatePremium.js';
import { createCoinElement } from './modules/createCoinElement.js';
import { renderTable } from './modules/kimpTableSort.js';
import { formatUpbitPrice } from './modules/formatUpbitPrice.js';
import { formatBybitPrice } from './modules/formatBybitPrice.js';

const ws = new WebSocket(`ws://${location.host}`);
let exchangeRate = null;
const coinData = {};
let sortDescending = false; // 초기 정렬 순서: 내림차순

// 정렬 상태를 로컬 스토리지에 저장하는 함수
function saveSortState(sortKey, sortDescending) {
    localStorage.setItem('sortKey', sortKey);
    localStorage.setItem('sortDescending', sortDescending);
}

// 로컬 스토리지에서 정렬 상태를 불러오는 함수
function loadSortState() {
    const sortKey = localStorage.getItem('sortKey');
    const sortDescending = localStorage.getItem('sortDescending') === 'true';
    return { sortKey, sortDescending };
}

ws.onopen = () => console.log("서버와 WebSocket 연결 성공");

ws.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);
        //console.log(message);
        if (message.source === "initial") {
            exchangeRate = message.exchangeRate;
            console.log('초기 달러 환율 1USD =>', exchangeRate);
            const { upbit, bybit } = message.data;

            // 로컬 스토리지에 정렬 정보가 없는 경우 기본 정렬 기준으로 렌더링
            const { sortKey, sortDescending } = loadSortState();

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
                // 서버에서 정렬된 데이터를 이미 받고 있으므로 바로 테이블 생성
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
            if(sortKey) {
                renderTable(sortDescending, coinData, exchangeRate, sortKey);
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
                document.getElementById(`upbit-${ticker}`).textContent = formatUpbitPrice(message.price);

                const signedChangeClass = message.signedChangeRate > 0 ? "rise" : message.signedChangeRate < 0 ? "fall" : "even";
                document.querySelector(`#signed-change-rate_${ticker}`).className = signedChangeClass;
                document.getElementById(`signed-change-rate_${ticker}`).textContent = `${message.signedChangeRate > 0 ? "+" : ""}${Math.floor(message.signedChangeRate * 10000) / 100}%`;
            } else if (message.source === "bybit") {
                coinData[ticker].bybitPrice = message.price;
                document.getElementById(`bybit-${ticker}`).textContent = formatBybitPrice(message.price);
            }

            
            updatePremium(ticker, coinData, exchangeRate);

            // 매번 실시간 데이터 업데이트 시 정렬 및 테이블 갱신
            renderTable(sortDescending, coinData, exchangeRate, localStorage.getItem('sortKey'));
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
};

ws.onerror = (error) => console.error("WebSocket 오류:", error);
ws.onclose = () => console.log("WebSocket 연결 종료");

// 정렬 버튼 클릭 이벤트 처리
document.querySelectorAll("#sortVolume").forEach(button => {
    button.addEventListener("click", (event) => {
        const selectSort = event.target.className;

        sortDescending = !sortDescending; // 정렬 순서 반전
        saveSortState(selectSort, sortDescending); // 정렬 상태 저장
        renderTable(sortDescending, coinData, exchangeRate, selectSort); // 테이블 재렌더링
    });
});

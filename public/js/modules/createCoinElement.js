export const createCoinElement = (
    ticker, 
    upbitPrice = "", 
    bybitPrice = "", 
    signedChangeRate = "", 
    lowest_52_week_price = "", 
    acc_trade_price_24h) => {
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
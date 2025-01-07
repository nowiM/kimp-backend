module.exports = (io, coinData, exchangeRate) => {
    // Socket.io 클라이언트 연결 처리
    io.on('connection', (socket) => {
        console.log('Client connected');
    
        const sortedData = Object.keys(coinData.upbit)
        .map(ticker => ({
            ticker,
            upbit: coinData.upbit[ticker],
            bybit: coinData.bybit[ticker] || null,
        }))
        .sort((a, b) => (b.upbit.acc_trade_price_24h || 0) - (a.upbit.acc_trade_price_24h || 0));
    
        const sortedCoinData = { upbit: {}, bybit: {} };
    
        sortedData.forEach(({ ticker, upbit, bybit }) => {
        sortedCoinData.upbit[ticker] = upbit;
        sortedCoinData.bybit[ticker] = bybit;
        });
    
        socket.emit('initial', { source: 'initial', data: sortedCoinData, exchangeRate: exchangeRate.value });
    
        socket.on('disconnect', () => {
        console.log('Client disconnected');
        });
    });
}
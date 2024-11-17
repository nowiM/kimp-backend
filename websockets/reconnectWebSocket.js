function reconnectWebSocket (connectFunction, retryCount = 0, maxRetries = 5, retryDelay = 1000) {
    if (retryCount >= maxRetries) {
        console.error(`Reached max retries (${maxRetries}). Stopping reconnection attempts.`);
        return;
    }

    const delay = retryDelay * Math.pow(2, retryCount); // 지수적 백오프
    console.log(`Reconnecting WebSocket in ${delay / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);

    setTimeout(() => {
        connectFunction(retryCount + 1); // 재연결 시도, 시도 횟수 증가
    }, delay);
};

module.exports = reconnectWebSocket;
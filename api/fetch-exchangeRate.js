const { google } = require('googleapis');
const sheets = google.sheets('v4');
require('dotenv').config(); // 환경변수 불러오기

// 서비스 계정 키를 환경 변수에서 파싱
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT, 'base64').toString());
const SCOPES = [process.env.GOOGLE_URL];
// 인증 설정
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
});

// 스프레드시트 ID 및 데이터 범위 설정
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = process.env.RANGE;

async function fetchExchangeRate() {
    const authClient = await auth.getClient();
    const request = {
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        auth: authClient,
    };

    try {
        const response = await sheets.spreadsheets.values.get(request);
        const rows = response.data.values;
        if (rows.length) {
            return rows[0][0]; // 환율 값 반환
        } else {
            console.log('No data found.');
            return null;
        }
    } catch (error) {
        console.error(`Error retrieving data: ${error}`);
        return null;
    }
}

const updateExchangeRate = async (io) => {
    const exchangeRate = await fetchExchangeRate();
    if (exchangeRate) {
        // 업데이트된 환율 값을 모든 클라이언트에 전송
        io.sockets.sockets.forEach(socket => {
            socket.emit('exchangeRateUpdate', { source: 'exchangeRateUpdate', exchangeRate });
        });
    }
};

module.exports = { fetchExchangeRate, updateExchangeRate };

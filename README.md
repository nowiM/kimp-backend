# Kimp-Backend

김프(Kimp) 관련 데이터를 실시간으로 처리하고 제공하는 백엔드 애플리케이션입니다.  
이 프로젝트는 업비트, 바이낸스 등의 암호화폐 데이터를 수집하고, 환율 정보를 제공하여 김치 프리미엄을 계산하는 데 사용됩니다.

-개발기간 : 2024.07 ~ 
-배포주소 : https://kimpviewer.com/

---

### 주요 기능
- 실시간 암호화폐 데이터 수집 및 처리
- 김프/역프 계산 및 제공
- 환율 데이터 업데이트
- 웹소켓을 통한 실시간 데이터 전송

---

기술 스택 (Tech Stack)
백엔드 프레임워크: Node.js, Express
데이터베이스: MongoDB
실시간 데이터 처리: WebSocket
데이터 요청: Axios

---

### 사용 예시
API 요청을 통해 데이터를 확인할 수 있습니다:
```bash
GET /api/fetch-upbit-tickers
GET /api/fetch-exchangeRate

---

구조 (Project Structure)
kimp-backend/
├── api/                     # 데이터 수집 관련 API
│   ├── fetch-bybit-tickers.js
│   ├── fetch-exchangeRate.js
│   └── fetch-upbit-tickers.js
├── controllers/             # 비즈니스 로직을 처리하는 컨트롤러
│   ├── chat.controller.js
│   └── user.controller.js
├── .env                     # 환경 변수 설정 파일
├── package.json             # 프로젝트 메타데이터 및 의존성 관리
├── server.js                # 서버 초기화 및 설정
└── README.md                # 프로젝트 설명서

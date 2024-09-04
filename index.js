// 웹소켓 
const {createServer} = require('http'); //http 라이브러리를 통해 createServer라는 서버를 만듬
const app = require('./server.js'); // 데이터 베이스 연결 부분을 불러옴
const {Server} = require('socket.io'); //웹소켓 서버를 만듬
require('dotenv').config();

// http서버에 데이터베이스를 연결
const httpServer = createServer(app);

// 웹소켓 서버랑 http 서버랑 연결
const  io = new Server(httpServer, {
    cors: {
        origin:'http://localhost:3000'
    }
}); 

require('./utils/io.js')(io) // io를 인자로 넘겨준다.

httpServer.listen(process.env.PORT, () => {
    console.log('server listening on port', process.env.PORT);
})
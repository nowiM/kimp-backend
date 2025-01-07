const userController = require('../controllers/user.controller.js');
const chatController = require('../controllers/chat.controller.js');

module.exports = (io) => {
    //io ... on: 듣는다 emit: 말한다.
    io.on('connection', async (socket) => {// 연결된 사람의 정보를 매개변수로 보내줌
        console.log('client is connected', socket.id);

        //chatController.deleteAllChats();// 과거 메세지 삭제

        // 클라이언트가 연결되면 과거 채팅 데이터를 보냄
        const pastMessages = await chatController.getChats();
        socket.emit('pastMessages', pastMessages); // 연결된 클라이언트에게 과거 메시지를 보냄

        socket.on('login', async (userName, cb) => {
            //console.log('backend ', userName);

            // 유저 정보를 저장
            try{
                const user = await userController.saveUser(userName, socket.id);
                cb({ok: true, data: user});
            } catch(error) {
                cb({ok: false, error: error.message});
            }
        });

        socket.on('sendMessage', async (message, cb) => {
            try {
                // 유저찾기 socket id로
                const user = await userController.checkUser(socket.id);
                // 메세지 저장
                const newMessage = await chatController.saveChat(message, user);
                
                // 아래와 같이 코드를 작성하지 않은 이유는 io 서버에 접속한 클이언트 모두에게 메세제가 보내져야 되기 때문이다.
                //cb({ok: true, data: newMessage})
                io.emit('message', newMessage);

                cb({ok: true});
            } catch(error) {
                cb({ok: false, error: error.message});
            }
        })

        socket.on('disconnect', () => {
            console.log('user is disconnect');
        });
    })
    
}
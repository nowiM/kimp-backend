const Chat = require('../models/chat.js');
const chatController = {};

chatController.saveChat = async (message, user) => {   
    const newMessage = new Chat({
        chat: message,
        user: {
            id: user._id,
            name: user.name,
        }
    });

    await newMessage.save();

    return newMessage;
}

// chatController.deleteAllChats = async () => {
//     try {
//         await Chat.deleteMany({});
//         console.log('All chats have been deleted.');
//     } catch (error) {
//         console.error('Error deleting chats:', error);
//     }
// };

// 과거 채팅을 불러오는 함수
chatController.getChats = async () => {
    // 최근 100개의 메시지만 가져오거나 필요에 따라 제한을 둘 수 있음
    const messages = await Chat.find().sort({ createdAt: 1 }).limit(10);

    return messages;
};

module.exports = chatController;
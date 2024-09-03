// 데이터 베이스 스키마를 생성한다.
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        chat: String, // 메세지 내용
        user: { // 누가 보냈는지(유저) 객체로 저장
            id: {// 유저의 id
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            name: String, // 유저의 이름
        },
    },
    {timestamp: true}
);

module.exports = mongoose.model('Chat', chatSchema);
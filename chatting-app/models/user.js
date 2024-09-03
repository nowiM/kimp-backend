// 데이터 베이스 스키마를 생성한다.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({// 내가 받을 데이터들을 설명한다.
    name: {
        type: String,
        required: [true, 'User must type name'],
        unique: true,
    },
    token: {// user id
        type: String,
    },
    online: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('User', userSchema);
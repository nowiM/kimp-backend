const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config() //env에서 설정한 환경변수를 불러오기 위해 선언 => process.env.DB
const cors = require('cors');
const app = express();

//백엔드는 같은 도메인이 아니면 프론트의 접근 막는 경향이 있음 왜냐하면 접근하는 프론트가 해커, 바이러스일 수 있기 때문이다.
app.use(cors()); //어떤 주소로든 접근 가능

//데이터베이스 연결
mongoose.connect(process.env.DB).then(() => console.log('connected to database'))

module.exports = app;
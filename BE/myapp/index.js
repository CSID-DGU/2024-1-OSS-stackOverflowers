import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

import workerRouter from './routes/worker.js';
import adminRouter from './routes/admin.js';
import adminEventsRouter from './routes/adminEvents.js';
import workerEventsRouter from './routes/workerEvents.js';
import homeRouter from './routes/home.js';

import cors from 'cors';

// __dirname 설정 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//body parser set
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

//미들웨어 실행
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//정적 파일 제공
app.use(express.static('views'));

// event route 사용
app.use('/admin/events', adminEventsRouter);
app.use('/worker/events', workerEventsRouter);
app.use('/home', homeRouter);

// session 미들웨어를 다른 미들웨어보다 먼저 설정
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// 근무자, 관리자 라우터 설정
app.use('/worker', workerRouter); // api사용시 /worker붙이고 사용
app.use('/admin', adminRouter); // api사용시 /admin붙이고 사용


// 정적 파일 제공 (React 빌드 폴더, react실행시 nunjucks 필요없음)
const buildPath = path.join(__dirname, '../../frontend/blog/src');//수정
app.use(express.static(buildPath));        

// React 빌드된 index.html 파일을 메인 엔트리로 제공

app.get('/*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.js')); //수정
});

const port = 3080;




// MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/shiftmate')
.then(() => console.log('MongoDB 성공적으로 연결'))
.catch(err => console.error('MongoDB 연결 중 에러가 발생:', err));

app.listen(3080,()=>{
    console.log('Server is running on port 3080');
});

app.use(cors({
    origin: 'http://localhost:3000', // 프론트엔드 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
//블로그 화면구성 메인페이지 네비게이션바 풋터
//블로그 CRUD 글작성,목록,상세페이지,수정,삭제
//nodemon 설치 npm install nodemon -D

// //템플릿 엔진 ejs nunjucks
app.set("view engine", "ejs");
app.set("views","./views");

// react파일을 사용하면 njucks 엔진은 필요없음.

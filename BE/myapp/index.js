import express from 'express';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

//writing, event 라우터 추가
import eventsRouter from './routes/events.js';

//관리자/근무자 라우터
import workerRouter from './routes/worker.js';
import adminRouter from './routes/admin.js';

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
app.use('/events', eventsRouter); // '/events' 경로에 이벤트 라우터 연결

// session 미들웨어를 다른 미들웨어보다 먼저 설정
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// 근무자, 관리자 라우터 설정
app.use('/worker', workerRouter);
app.use('/admin', adminRouter);

//nunjucks
// nunjucks 설정 수정
nunjucks.configure(path.join(__dirname, 'views'), {
    express: app,
    watch: true
});             

const port = 3080;


// MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/shiftmate')
.then(() => console.log('MongoDB 성공적으로 연결'))
.catch(err => console.error('MongoDB 연결 중 에러가 발생:', err));


// 메인 페이지 (로그인 페이지)
app.get('/', (req, res) => {
    res.render('login.html');
});

// 회원가입 페이지
app.get('/signup', (req, res) => {
    res.render('signup.html');
});


app.listen(3080,()=>{
    console.log('Server is running on port 3080');
});

//블로그 화면구성 메인페이지 네비게이션바 풋터
//블로그 CRUD 글작성,목록,상세페이지,수정,삭제
//nodemon 설치 npm install nodemon -D

//템플릿 엔진 ejs nunjucks
app.set("view engine", "ejs");
app.set("views","./views");

// 글작성
// 글 목록 main page 페이지 접속, GET요청 /
// 글 작성 write page 접속 GET 작성 POST /write
// 글 상세 페이지 detail page 접속 GET /detail
// 글 수정 페이지 edit page 접속 GET 수정 POST /edit 

//버퍼 데이터 <Buffer 5b 5d>를 얻음 


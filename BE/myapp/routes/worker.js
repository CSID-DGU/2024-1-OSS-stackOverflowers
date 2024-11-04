import express from 'express';
import Worker from '../models/Worker.js';

const router = express.Router();

// 근무자 메인 페이지
router.get('/main', (req, res) => {
    // 세션 체크
    if (!req.session.userId || req.session.userType !== 'worker') {
        return res.redirect('/');
    }
    res.render('worker/main.html');
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        const worker = await Worker.findOne({ phone });
        if (!worker) {
            return res.status(404).json({ message: "존재하지 않는 회원입니다." });
        }

        const isMatch = await worker.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: "전화번호/비밀번호가 일치하지 않습니다." 
            });
        }

        // 세션에 사용자 정보 저장
        req.session.userId = worker._id;
        req.session.userType = 'worker';
        
        res.status(200).json({ 
            message: "로그인 성공!", 
            redirectUrl: '/worker/main'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        // 기존 사용자 확인
        const existingWorker = await Worker.findOne({ phone });
        if (existingWorker) {
            return res.status(400).json({ 
                message: "이미 존재하는 회원입니다" 
            });
        }

        // 새 사용자 생성
        const worker = new Worker({ phone, password });
        await worker.save();

        res.status(201).json({ 
            message: "회원가입 성공! 로그인 해주세요.",
            redirectUrl: '/'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

 
export default router;
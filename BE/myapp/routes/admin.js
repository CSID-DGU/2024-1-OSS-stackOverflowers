import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// 관리자 메인 페이지
router.get('/main', (req, res) => {
    // 세션 체크
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/');
    }
    res.render('admin/main.html');
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        const admin = await Admin.findOne({ phone });
        if (!admin) {
            return res.status(404).json({ message: "존재하지 않는 회원입니다." });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: "전화번호/비밀번호가 일치하지 않습니다." 
            });
        }

        // 세션에 사용자 정보 저장
        req.session.userId = admin._id;
        req.session.userType = 'admin';
        
        res.status(200).json({ 
            message: "로그인 성공!", 
            redirectUrl: '/admin/main'
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
        
        // 기존 관리자 확인
        const existingAdmin = await Admin.findOne({ phone });
        if (existingAdmin) {
            return res.status(400).json({ 
                message: "이미 존재하는 회원입니다" 
            });
        }

        // 새 관리자 생성
        const admin = new Admin({ phone, password });
        await admin.save();

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
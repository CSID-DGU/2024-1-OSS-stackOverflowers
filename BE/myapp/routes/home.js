import express from 'express';
import Admin from '../models/Admin.js';
import Worker from '../models/Worker.js';
const router = express.Router();

// 통합 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { id, name, password, phone, userType } = req.body;
        
        // userType에 따라 적절한 모델 선택
        const Model = userType === 'admin' ? Admin : Worker;
        
        // 기존 사용자 확인 (관리자와 근무자 모두 확인)
        const existingAdmin = await Admin.findOne({ $or: [{ id }, { phone }] });
        const existingWorker = await Worker.findOne({ $or: [{ id }, { phone }] });
        
        if (existingAdmin || existingWorker) {
            return res.status(400).json({ 
                message: "이미 존재하는 회원입니다",
                redirectUrl: '/home/login'
            });
        }

        // 새 사용자 생성
        const user = new Model({ id, name, password, phone });
        await user.save();

        res.status(201).json({ 
            message: "회원가입 성공! 로그인 해주세요.",
            redirectUrl: '/home/login',
            success: true,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: "서버 오류가 발생했습니다.",
            error: true,
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { id, password, userType } = req.body;
        
        const Model = userType === 'admin' ? Admin : Worker;
        const user = await Model.findOne({ id });
        
        if (!user) {
            return res.status(404).json({ message: "존재하지 않는 회원입니다." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: "비밀번호가 일치하지 않습니다." 
            });
        }

        // 세션에 사용자 정보 저장
        if (req.session) {
            req.session.userId = user._id;
            req.session.userType = userType;
        }
        
        const redirectUrl = userType === 'admin' ? '/admin/main' : '/worker/main';
        
        res.status(200).json({ 
            message: "로그인 성공!", 
            redirectUrl
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

export default router;
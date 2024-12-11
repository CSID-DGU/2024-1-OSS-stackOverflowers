import express from 'express';
import Admin from '../models/Admin.js';
import Worker from '../models/Worker.js';
const router = express.Router();

// 세션 확인 미들웨어 정의
const checkSession = (req, res, next) => {
    console.log('Session:', req.session); // 세션 상태 로깅
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "세션이 만료되었습니다." });
    }
  };

// 통합 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { id, userName, password, phone, userType } = req.body;
        
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
        const user = new Model({ id, userName, password, phone });
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
        console.log('Login attempt:', { id, userType }); // 로그인 시도 정보 출력
        console.log('Session before:', req.session); // 세션 초기 상태 확인

        const Model = userType === 'admin' ? Admin : Worker;
        const user = await Model.findOne({ id });
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: "존재하지 않는 회원입니다." });
        }

        console.log('User found:', user._id); // 찾은 사용자 정보 출력

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
        
        // 세션 저장 확인을 위한 Promise 래핑
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log('Session after:', req.session); // 최종 세션 상태 확인

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

// 로그아웃 라우트 추가
router.post('/logout',checkSession, (req, res) => {
    try {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ 
                        message: "로그아웃 처리 중 오류가 발생했습니다." 
                    });
                }
                
                res.clearCookie('connect.sid');
                res.status(200).json({ 
                    message: "로그아웃 되었습니다.",
                });
            });
        } else {
            res.status(200).json({ 
                message: "이미 로그아웃된 상태입니다.",
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: "서버 오류가 발생했습니다." 
        });
    }
});

router.get('/session', (req, res) => {
    console.log('세션 요청 받음:', req.session);
    
    if (req.session && req.session.userId) {  // userId 대신 id 사용
      res.json({
        userId: req.session.userId,     // MongoDB의 id 필드와 매칭
        userType: req.session.userType,
        userName: req.session.userName  // userName 대신 name 사용
      });
    } else {
      res.status(401).json({ 
        message: '세션이 없거나 만료되었습니다.' 
      });
    }
});

  export default router;
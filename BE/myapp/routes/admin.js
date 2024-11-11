import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// 관리자 메인 페이지
router.get('/main', (req, res) => {
    // 세션 체크
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/');
    }
    //res.sendFile(path.join(buildPath, 'index.html')); //react index.html로 렌더링 (수정 필요)
});

export default router;
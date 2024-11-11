import express from 'express';
import Worker from '../models/Worker.js';
const router = express.Router();

// 근무자 메인 페이지
router.get('/home', (req, res) => {
    // 세션 체크
    if (!req.session.userId || req.session.userType !== 'worker') {
        return res.redirect('/');
    }
    res.redirect('/worker/main');
});


 
export default router;
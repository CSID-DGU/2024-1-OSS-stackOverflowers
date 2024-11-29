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

router.get('/main', (req, res) => {
    res.render('Home_worker')
})
 

//근무자 정보 가져오는 API
// 모든 Worker 데이터 가져오기
router.get('/getinfo', async (req, res) => {
    try {
      const workers = await Worker.find({}, { 
        id: 1, 
        userName: 1, 
        phone: 1,
        rejections: 1,
        lastShiftStart: 1,
        lastShiftEnd: 1,
        _id: 0 
      });
      
      res.json(workers);
    } catch (error) {
      console.error('Workers 데이터 조회 오류:', error);
      res.status(500).json({ 
        message: "Workers 데이터를 불러오는데 실패했습니다.",
        error: error.message 
      });
    }
  });
export default router;
import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// 관리자 메인 페이지
router.get('/home', (req, res) => {
    // 세션 체크
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.redirect('/');
    }
    //res.sendFile(path.join(buildPath, 'index.html')); //react index.html로 렌더링 (수정 필요)
    res.redirect('/admin/main');
});

//main 페이지로 렌더링
router.get('/main', (req, res) => {
    res.render('Home_admin')
});

// 모든 Admin 데이터 가져오기
router.get('/getinfo', async (req, res) => {
    try {
      const admins = await Admin.find({}, { 
        id: 1, 
        userName: 1, 
        phone: 1,
        _id: 0 
      });
      
      res.json(admins);
    } catch (error) {
      console.error('Admins 데이터 조회 오류:', error);
      res.status(500).json({ 
        message: "Admins 데이터를 불러오는데 실패했습니다.",
        error: error.message 
      });
    }
  });
  
export default router;
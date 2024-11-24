import express from 'express';
import Event from '../models/Event.js';
import ShiftRequest from '../models/ShiftRequest.js';

const router = express.Router();

// 근무자 일정 조회(GET) admin과 api같게 설정.
router.get('/all', async (req, res) => {
    const events = await Event.find({});
    res.json(events);
});


// 근무 신청 (POST)
router.post('/apply', async (req, res) => {
    const { workerId, userName, start, end, lastShiftStart, lastShiftEnd, description } = req.body;

    // 필수 필드가 모두 있는지 확인
    if (!workerId || !userName || !start || !end || !lastShiftStart || !lastShiftEnd) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        const newRequest = new ShiftRequest({
            workerId,
            userName,
            start: new Date(start),
            end: new Date(end),
            lastShiftStart: new Date(lastShiftStart),
            lastShiftEnd: new Date(lastShiftEnd),
            description
        });

        await newRequest.save();
        res.status(201).json({ message: '근무 신청이 성공적으로 접수되었습니다.' });
    } catch (error) {
        console.error('Shift Request 생성 중 오류:', error);
        res.status(500).json({ message: '근무 신청에 실패했습니다.' });
    }
});

// 근무 신청 조회
router.get('/apply/:workerId', async (req, res) => {
    const requests = await ShiftRequest.find({ workerId: req.params.workerId });
    res.json(requests);
});

export default router;
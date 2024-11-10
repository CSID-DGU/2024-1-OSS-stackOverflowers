import express from 'express';
import Event from '../models/Event.js';
//import ShiftRequest from '../models/ShiftRequest.js';

const router = express.Router();

// 근무자 일정 조회(GET) admin과 api같게 설정.
router.get('/admin/events/all', async (req, res) => {
    const events = await Event.find({});
    res.json(events);
});

//근무 신청기능 추가 예정
// 근무 신청 (POST)
router.post('/worker/events/apply', async (req, res) => {
    const { workerId, name, start, end, description } = req.body;
    const newRequest = new ShiftRequest({ workerId, name, start, end, description });
    await newRequest.save();
    res.status(201).json({ message: 'Shift request submitted' });
});

// 근무 신청 조회
router.get('/worker/events/apply/:workerId', async (req, res) => {
    const requests = await ShiftRequest.find({ workerId: req.params.workerId });
    res.json(requests);
});

export default router;
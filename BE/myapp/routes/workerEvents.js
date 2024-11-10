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
    try {
        const { workerId, name, start, end, description } = req.body;
        const newRequest = new ShiftRequest({ workerId, name, start, end, description });
        await newRequest.save();
        res.status(201).json({ message: 'Shift request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit shift request' });
    }
});

// 근무 신청 조회
router.get('/apply/:workerId', async (req, res) => {
    const requests = await ShiftRequest.find({ workerId: req.params.workerId });
    res.json(requests);
});

export default router;
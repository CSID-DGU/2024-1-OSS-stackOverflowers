// events.js
import express from 'express';
import Event from '../models/Event.js'; // 이벤트 모델 참조 (모델 위치에 따라 경로 조정)

const router = express.Router();

// 이벤트 생성create (GET)
router.get('/admin/events/create', (req, res) => {
    res.render('createEvent'); // 이벤트 생성 페이지 템플릿을 렌더링
});

// 이벤트 생성create (POST)
router.post('/admin/events/create', async (req, res) => {
    const { date, start, end, description } = req.body;
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);
    
    const newEvent = new Event({
        title: description,  // 필요시 입력받을 수 있음
        start: startDate,
        end: endDate,
        description,
        allDay: false
    });

    try {
        await newEvent.save();
        console.log('Event created successfully');
        res.redirect('/');  // 생성 후 메인 페이지로 리디렉션
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create event');
    }
});



// 이벤트 수정  (GET /events/edit/:id)
router.get('admin/events/edit/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        res.render('eventEdit', { event }); // editEvent 템플릿 렌더링
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to load event for editing');
    }
});

// 이벤트 수정 (POST /events/edit/:id)
router.post('admin/events/edit/:id', async (req, res) => {
    const { title, start, end, description, allDay } = req.body; // 수정된 데이터 가져오기
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { title, start, end, description, allDay },
            { new: true } // 수정 후 업데이트된 데이터를 반환
        );
        if (!updatedEvent) {
            return res.status(404).send('Event not found');
        }
        console.log('Event updated successfully');
        res.redirect('/'); // 수정 후 메인 페이지로 리디렉션
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update event');
    }
});



// 이벤트 삭제 (POST /events/delete/:id)
router.post('admin/events/delete/:id', async (req, res) => {
    try {
        await Event.deleteOne({ _id: req.params.id }); // 이벤트 삭제
        console.log('Event deleted successfully');
        res.redirect('/'); // 삭제 후 메인 페이지로 리디렉션
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete event');
    }
});


// 이벤트 조회 API
router.get('admin/events/all', async (req, res) => {
    try {
        const events = await Event.find({});
    // FullCalendar 형식에 맞게 데이터 가공
        const formattedEvents = events.map(event => ({
            id: event._id,
            title: event.title,
            start: event.start,
            end: event.end,
            description: event.description,
            allDay: event.allDay
        }));
        res.json(formattedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve events');
    }
});


//근무 신청 승인POST//
router.post('/worker/events/approve/:requestId', async (req, res) => {
    try {
        // 승인할 신청서 조회
        const requestToApprove = await ShiftRequest.findById(req.params.requestId);
        if (!requestToApprove) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // 동일한 시간대에 신청된 근무자 목록 조회 (이미 승인된 신청자 포함)
        const overlappingRequests = await ShiftRequest.find({
            start: { $lt: requestToApprove.end },
            end: { $gt: requestToApprove.start },
            status: 'Approved'
        });

        // 만약 해당 시간대에 이미 근무자가 최대 인원에 도달한 경우
        if (overlappingRequests.length >= MAX_WORKERS_PER_SHIFT) {
            return res.status(400).json({ message: 'Maximum workers already assigned for this shift' });
        }

        // 근무 신청 승인
        requestToApprove.status = 'Approved';
        await requestToApprove.save();
        res.status(200).json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to approve request' });
    }
});

// 근무 신청 거절 (POST)
router.post('/worker/events/reject/:requestId', async (req, res) => {
    try {
        const request = await ShiftRequest.findByIdAndUpdate(req.params.requestId, { status: 'Rejected' });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reject request' });
    }
});


export default router;

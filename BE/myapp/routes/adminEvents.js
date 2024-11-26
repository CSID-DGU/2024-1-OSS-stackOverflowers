// events.js
import express from 'express';
import Event from '../models/Event.js'; // 이벤트 모델 참조 (모델 위치에 따라 경로 조정)
import ShiftRequest from '../models/ShiftRequest.js';
import Schedule from '../models/Schedule.js';  // Schedule 모델 임포트 추가

const router = express.Router();

// 이벤트 생성 (GET)
router.get('/create', (req, res) => {
const router = express.Router();
});

// 이벤트 생성create (GET)
router.get('/create', (req, res) => {
    res.render('CreateEvent'); // 이벤트 생성 페이지 템플릿을 렌더링
});

// 이벤트 생성create (POST)
router.post('/create', async (req, res) => {
    try {
        const {events, startDate, endDate, workers, timeUnit, startHour, endHour, deadline} = req.body;
        
        // 유효성 검사
        if (!events || !events.length) {
            return res.status(400).json({ message: '최소 하나 이상의 이벤트가 필요합니다.' });
        }

        // 이벤트 배열 생성
        const eventDocuments = await Promise.all(events.map(async (event) => {
            const newEvent = new Event({
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay || false
            });
            await newEvent.save();
            return newEvent;
        }));

        // 새로운 스케줄 생성
        const newSchedule = new Schedule({
            events: eventDocuments.map(event => event._id), // 이벤트 참조 저장
            startDate,
            endDate,
            workers,
            timeUnit,
            startHour,
            endHour,
            deadline
        });

        await newSchedule.save();
        
        console.log('Schedule created successfully');
        res.status(201).json({ 
            message: 'Schedule created successfully', 
            schedule: newSchedule 
        });

    } catch (error) {
        console.error('Schedule creation error:', error);
        res.status(500).json({ message: 'Failed to create schedule' });
    }
}); 




// 이벤트 수정  (GET /events/edit/:id)
router.get('/edit/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).send('Event not found');
        }
        // React로 리디렉션
        res.status(200).json({ event }); //React 컴포넌트에서 useEffect를 사용하여 API로부터 데이터를 가져와야함!
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to load event for editing');
    }
});

// 이벤트 수정 (POST /events/edit/:id)
router.post('/edit/:id', async (req, res) => {
    const { title, start, end, description, allDay } = req.body; // 수정된 데이터 가져오기
     // 시작 및 종료 시간을 Date 객체로 변환
     const startDate = new Date(start);
     const endDate = new Date(end);
 
     try {
         const updatedEvent = await Event.findByIdAndUpdate(
             req.params.id,
             { 
                 title, 
                 start: startDate, 
                 end: endDate, 
                 description, 
                 allDay 
             },
             { new: true } // 수정 후 업데이트된 데이터를 반환
         );
 
         if (!updatedEvent) {
             return res.status(404).json({ message: 'Event not found' });
         }
         console.log('Event updated successfully');
         res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
     } catch (error) {
         console.error('Failed to update event:', error);
         res.status(500).json({ message: 'Failed to update event' });
     }
 });


// 이벤트 삭제 (POST /events/delete/:id)
router.post('/delete/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        
        // 삭제된 이벤트가 없는 경우 처리
        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log('Event deleted successfully');
        // JSON 응답으로 성공 메시지 반환
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Failed to delete event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});

router.get('/all', (req, res) => {
    res.render('ViewSchedule_admin'); // 이벤트 생성 페이지 템플릿을 렌더링
});

// 이벤트 조회 API
router.get('/all', async (req, res) => {
    try {
                // Schedule 데이터를 조회하고 events 필드의 Event 정보도 함께 가져옴
                const schedules = await Schedule.find({})
                .populate('events')  // events 배열의 Event 문서들을 가져옴
                .exec();
    
            // 모든 스케줄의 이벤트들을 FullCalendar 형식으로 변환
            const formattedEvents = schedules.flatMap(schedule => {
                return schedule.events.map(event => ({
                    id: event._id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    description: event.description,
                    allDay: event.allDay,
                    // 스케줄 관련 추가 정보
                    scheduleId: schedule._id,
                    workers: schedule.workers,
                    timeUnit: schedule.timeUnit,
                    startHour: schedule.startHour,
                    endHour: schedule.endHour,
                    deadline: schedule.deadline
                }));
            });
    
        res.json(formattedEvents);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve events');
    }
});

// 모든 근무 신청 조회 (GET /admin/events/requests)
router.get('/requests', async (req, res) => {
    try {
        const shiftRequests = await ShiftRequest.find({}).populate('workerId', 'userName');
        res.status(200).json(shiftRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve shift requests' });
    }
});



// 근무자 선발 알고리즘 함수
const selectWorkers = async () => {
    const requests = await ShiftRequest.find({ status: 'Pending' });
    const MAX_WORKERS = 3; // 근무자 최대 인원
    // 점수 계산 및 정렬
    const sortedRequests = requests
        .map(request => {
            // 마지막 근무로부터 경과한 시간 (시간 단위)
            const hoursSinceLastShift = (new Date() - new Date(request.lastShiftEnd)) / (1000 * 60 * 60);

            // 점수 계산: 마지막 근무 경과 시간 + 거절 횟수에 따른 가산점
            const score = hoursSinceLastShift + request.rejections * 5;
            return { ...request.toObject(), score };
        })
        .sort((a, b) => b.score - a.score); // 높은 점수 순으로 정렬

    // 선발된 근무자와 거절된 근무자 분리
    const selectedWorkers = sortedRequests.slice(0, MAX_WORKERS);
    const rejectedWorkers = sortedRequests.slice(MAX_WORKERS);

    // 근무자 상태 업데이트
    for (const worker of selectedWorkers) {
        await ShiftRequest.findByIdAndUpdate(worker._id, { status: 'Approved' });
    }
    for (const worker of rejectedWorkers) {
        await ShiftRequest.findByIdAndUpdate(worker._id, { status: 'Rejected' });
    }

    // 선발된 근무자와 거절된 근무자를 필요한 형태로 반환
    return {
        selectedWorkers: selectedWorkers.map(worker => ({
            userName: worker.userName,
            score: worker.score
        })),
        rejectedWorkers: rejectedWorkers.map(worker => ({
            userName: worker.userName,
            score: worker.score
        }))
    };
};

// 근무자 선발 API
router.post('/approve', async (req, res) => {
    try {
        // 근무자 선발 알고리즘 실행
        const { selectedWorkers, rejectedWorkers } = await selectWorkers();

        // 결과를 클라이언트로 반환
        res.status(200).json({
            message: '근무자 선발 완료',
            selectedWorkers,
            rejectedWorkers
        });
    } catch (error) {
        console.error('근무자 선발 오류:', error);
        res.status(500).json({ message: '근무자 선발에 실패했습니다.' });
    }
});


//근무 신청 승인POST//
router.post('/approve/:requestId', async (req, res) => {

    const MAX_WORKERS_PER_SHIFT = 3; // 근무자 최대 인원
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
router.post('/reject/:requestId', async (req, res) => {
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

// events.js
import express from 'express';
import Event from '../models/Event.js'; // 이벤트 모델 참조 (모델 위치에 따라 경로 조정)
import ShiftRequest from '../models/ShiftRequest.js';

const router = express.Router();

// 이벤트 생성create (GET)
// router.get('/create', (req, res) => {
//     res.render('createEvent'); // 이벤트 생성 페이지 템플릿을 렌더링
// });

// 이벤트 생성create (POST)
router.post('/create', async (req, res) => {
    const { title, start, end, description,allDay } = req.body;
    
     // 입력 데이터 유효성 검사
    if (!title || !start || !end) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }


     // 날짜 형식 유효성 검사
     const startDate = new Date(start);
     const endDate = new Date(end);
     
     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
         return res.status(400).json({ message: '유효한 날짜와 시간을 입력해주세요.' });
     }

     const newEvent = new Event({
        title,
        start: startDate,
        end: endDate,
        description,
        allDay: allDay || false
    });

    try {
        await newEvent.save();
        console.log('Event created successfully');
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create event' });
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


// 이벤트 조회 API
router.get('/all', async (req, res) => {
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

// 모든 근무 신청 조회 (GET /admin/events/requests)
router.get('/requests', async (req, res) => {
    try {
        const shiftRequests = await ShiftRequest.find({}).populate('workerId', 'name');
        res.status(200).json(shiftRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve shift requests' });
    }
});



// 근무자 선발 알고리즘 함수
const selectWorkers = async (timeSlot, maxWorkers) => {
    // 특정 시간대의 Pending 상태 신청 조회
    const requests = await ShiftRequest.find({
        status: 'Pending',
        start: timeSlot.start,
        end: timeSlot.end
    });

    // 우선순위 가중치
    const priorityWeights = { 1: 4, 2: 2, 3: 0 }; // 1순위: +4, 2순위: +2, 3순위: +0

    const sortedRequests = requests
        .map(request => {
            const hoursSinceLastShift = (new Date() - new Date(request.lastShiftEnd)) / (1000 * 60 * 60);
            const score = hoursSinceLastShift + request.rejections * 5 + priorityWeights[request.priority];
            return { ...request.toObject(), score };
        })
        .sort((a, b) => b.score - a.score); // 높은 점수 순 정렬

    const selectedWorkers = [];
    const rejectedWorkers = [];

    for (const request of sortedRequests) {
        if (selectedWorkers.length < maxWorkers) {
            // 채택된 근무자 처리
            await ShiftRequest.findByIdAndUpdate(request._id, {
                status: 'Approved',
                priority: 1,
                rejections: 0 // rejections 초기화
            });

            // 캘린더에 일정 저장
            const newEvent = new Event({
                title: `근무자: ${request.name}`,
                start: request.start,
                end: request.end,
                description: request.description,
                allDay: false
            });
            await newEvent.save();

            selectedWorkers.push(request);
        } else {
            // 거절된 근무자 처리
            if (request.priority < 3) {
                // 1순위 -> 2순위, 2순위 -> 3순위로 변경
                await ShiftRequest.findByIdAndUpdate(request._id, {
                    priority: request.priority + 1,
                    rejections: request.rejections + 1
                });
            } else {
                // 최종 거절
                await ShiftRequest.findByIdAndUpdate(request._id, {
                    status: 'Rejected',
                    rejections: request.rejections + 1
                });
                rejectedWorkers.push(request);
            }
        }
    }

    return { selectedWorkers, rejectedWorkers };
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










//근무 신청 승인POST//(필요없음)
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

// 근무 신청 거절 (POST)(필요없음)
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

// events.js
import express from 'express';
import Event from '../models/Event.js'; // 이벤트 모델 참조 (모델 위치에 따라 경로 조정)
import ShiftRequest from '../models/ShiftRequest.js';
import Worker from '../models/Worker.js'; // Worker 스키마 참조
import Schedule from '../models/Schedule.js';  // Schedule 모델 임포트 추가
import cron from 'node-cron'

const router = express.Router();

/* // 이벤트 생성 (GET)
router.get('/create', (req, res) => {
const router = express.Router();
}); */



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

router.post('/apply', async (req, res) => {
    try {
        const { shiftRequests } = req.body;
        const sessionUserId = req.session.userId;

        // 1. Worker 찾기
        const worker = await Worker.findById(sessionUserId);
        if (!worker) {
            return res.status(404).json({ message: '근무자 정보를 찾을 수 없습니다.' });
        }

        // 2. 이전 신청 내역 모두 삭제
        await ShiftRequest.deleteMany({ workerId: worker._id });

        // 3. 새로운 ShiftRequest 생성 및 저장
        const requestsToSave = shiftRequests.map(request => {
            if (!request.start || !request.end || !request.lastShiftStart || 
                !request.lastShiftEnd || !request.priority) {
                throw new Error('필수 필드가 누락되었습니다.');
            }

            return {
                workerId: worker._id,
                userName: worker.userName,
                start: request.start,
                end: request.end,
                lastShiftStart: request.lastShiftStart,
                lastShiftEnd: request.lastShiftEnd,
                status: request.status || 'Pending',
                description: request.description,
                priority: request.priority
            };
        });

        const savedRequests = await ShiftRequest.insertMany(requestsToSave);

        res.status(201).json({ 
            message: '근무 신청이 성공적으로 접수되었습니다.',
            requests: savedRequests
        });

    } catch (error) {
        console.error('Shift Request 생성 중 오류:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: '데이터 검증 실패',
                error: error.message,
                details: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        res.status(500).json({ 
            message: '근무 신청에 실패했습니다.',
            error: error.message 
        });
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
    res.sendFile(path.join(__dirname, '../frontend/blog/build/index.html'));
});

//이벤트 조회 API
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
const selectWorkers = async (timeSlot, maxWorkers) => {
    // 특정 시간대의 Pending 상태 신청 조회
    const requests = await ShiftRequest.find({
        status: 'Pending',
        start: timeSlot.start,
        end: timeSlot.end
    });

    // 우선순위 가중치
    const priorityWeights = { 1: 50, 2: 30, 3: 20 }; // 1순위: +50, 2순위: +30, 3순위: +20 가중치 변경
    const sortedRequests = requests
        .map(request => {
            const hoursSinceLastShift = (new Date() - new Date(request.lastShiftEnd)) / (1000 * 60 * 60 * 24); //시간-> 일단위 변경
            // 우선순위에 따른 가중치 추가
            score += priorityWeights[request.priority];

            // 점수 계산: 마지막 근무 경과 시간 + 거절 횟수에 따른 가산점
            let score = hoursSinceLastShift + request.rejections * 5 + priorityWeights[request.priority];;

            return { ...request.toObject(), score };
        })
        .sort((a, b) => b.score - a.score); // 높은 점수 순 정렬

    const selectedWorkers = [];
    const rejectedWorkers = [];


    // 거절된 근무자 중 1순위가 있다면 해당 우선순위를 2로 변경
    for (const worker of rejectedWorkers) {
        if (worker.priority === 1) {
            await ShiftRequest.findByIdAndUpdate(worker._id, { priority: 2 });
        } else if (worker.priority === 2) {
            await ShiftRequest.findByIdAndUpdate(worker._id, { priority: 3 });
        }
    }

    // 근무자 상태 업데이트
    for (const worker of selectedWorkers) {
        await ShiftRequest.findByIdAndUpdate(worker._id, { status: 'Approved' });
    }
    for (const worker of rejectedWorkers) {
        await ShiftRequest.findByIdAndUpdate(worker._id, { status: 'Rejected' });

    for (const request of sortedRequests) {
        if (selectedWorkers.length < maxWorkers) {
            // 채택된 근무자 처리
            await ShiftRequest.findByIdAndUpdate(request._id, {
                status: 'Approved',
                priority: 1,
                rejections: 0 // rejections 초기화
            });

            /* // 캘린더에 일정 저장
            const newEvent = new Event({
                title: `근무자: ${request.name}`,
                start: request.start,
                end: request.end,
                description: request.description,
                allDay: false
            });
            await newEvent.save(); */

            // Event 테이블에 선택된 근무자 ID 추가
            await Event.findOneAndUpdate(
                {
                    start: timeSlot.start,
                    end: timeSlot.end
                },
                {
                    $addToSet: { workers: request.id } // 중복 방지를 위해 $addToSet 사용
                },
                { upsert: true } // 해당 시간대의 Event가 없다면 새로 생성
            );

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

    // 선발된 근무자와 거절된 근무자를 필요한 형태로 반환
    return {
        selectedWorkers: selectedWorkers.map(worker => ({
            userName: worker.userName,
            userId: worker.id,
            score: worker.score
        })),
        rejectedWorkers: rejectedWorkers.map(worker => ({
            userName: worker.userName,
            userId: worker.id,
            score: worker.score
        }))
    };

};
};
//request? 
//이벤트에 근무자들을 title이 아닌 workers에 id로 저장

// 자동 근무자 선발 함수
async function autoSelectWorkers() {
    try {
        const now = new Date();
        
        // deadline이 지난 Schedule 조회
        const expiredSchedules = await Schedule.find({
            deadline: { $lt: now },
            status: 'PENDING' // 아직 처리되지 않은 스케줄
        });

        console.log(`${expiredSchedules.length}개의 마감된 스케줄에 대해 근무자 선발을 시작합니다.`);

        // 각 스케줄에 대해 처리
        for (const schedule of expiredSchedules) {
            try {
                // 해당 스케줄의 모든 Event 조회
                const events = await Event.find({
                    start: { $gte: schedule.startDate },
                    end: { $lte: schedule.endDate }
                });

                console.log(`스케줄 ID ${schedule._id}에 대한 ${events.length}개의 이벤트 처리 시작`);

                // 각 Event에 대해 근무자 선발
                for (const event of events) {
                    const timeSlot = {
                        start: event.start,
                        end: event.end
                    };

                    // 근무자 선발 알고리즘 실행
                    const { selectedWorkers, rejectedWorkers } = await selectWorkers(timeSlot, schedule.maxWorkersPerShift);

                    // Event 업데이트는 selectWorkers 함수 내에서 처리됨 (이미 구현되어 있음)
                    
                    // 로그 기록
                    console.log(`이벤트 처리 완료 (${event.start} ~ ${event.end}):`, {
                        selected: selectedWorkers.length,
                        rejected: rejectedWorkers.length
                    });
                }

                // 모든 이벤트 처리 완료 후 Schedule 상태 업데이트
                await Schedule.findByIdAndUpdate(schedule._id, {
                    status: 'COMPLETED',
                    lastProcessed: new Date()
                });

            } catch (error) {
                console.error(`스케줄 ID ${schedule._id} 처리 중 오류:`, error);
                
                // 오류 발생 시 Schedule 상태 업데이트
                await Schedule.findByIdAndUpdate(schedule._id, {
                    status: 'ERROR',
                    lastError: error.message,
                    lastProcessed: new Date()
                });
            }
        }
    } catch (error) {
        console.error('자동 근무자 선발 중 오류 발생:', error);
    }
}

// 매일 자정에 실행
cron.schedule('0 0 * * *', async () => {
    console.log('자동 근무자 선발 크론 작업 시작:', new Date());
    await autoSelectWorkers();
});


// 수동 실행을 위한 API 엔드포인트 유지
router.post('/approve', async (req, res) => {
    try {
        // timeSlot과 maxWorkers를 요청에서 받아옴
        const { timeSlot, maxWorkers } = req.body;
        
        // 근무자 선발 알고리즘 실행
        const { selectedWorkers, rejectedWorkers } = await selectWorkers(timeSlot, maxWorkers);

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

/* // 근무자 선발 API
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
 */




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
        // 신청 ID로 근무 신청 조회
        const request = await ShiftRequest.findById(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Worker 컬렉션에서 거절 횟수 업데이트
        await Worker.findByIdAndUpdate(
            request.workerId,
            { $inc: { rejections: 1 } } // rejections 필드 +1
        );

        // 근무 신청 삭제
        await ShiftRequest.findByIdAndDelete(req.params.requestId);

        res.status(200).json({ message: 'Request rejected and worker updated' });
    } catch (error) {
        console.error('Failed to reject request:', error);
        res.status(500).json({ message: 'Failed to reject request' });
    }
});

export default router;
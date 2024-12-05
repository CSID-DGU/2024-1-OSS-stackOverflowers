import express from 'express';
import Event from '../models/Event.js';
import Schedule from '../models/Schedule.js'
import ShiftRequest from '../models/ShiftRequest.js';
import Worker from '../models/Worker.js';
import mongoose from 'mongoose';

const router = express.Router();

// 근무자 일정 조회(GET) admin과 api같게 설정.
router.get('/all', async (req, res) => {
    const events = await Event.find({});
    res.json(events);
});


router.get('/apply', async (req, res) => {
    try {
      // 현재 신청 가능한 스케줄 조회 (마감기한이 지나지 않은)
      const currentSchedule = await Schedule.findOne({
        deadline: { $gt: new Date() },
        selectionStatus: 'Pending'
      }).populate('events').sort({ startDate: -1 });
  
      if (!currentSchedule) {
        return res.status(404).json({ 
          message: '현재 신청 가능한 스케줄이 없습니다.' 
        });
      }
  
      // FullCalendar에서 사용할 수 있는 형태로 이벤트 데이터 변환
      const calendarEvents = currentSchedule.events.map(event => ({
        id: event._id.toString(),
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: '#d1d1d1',
        extendedProps: {
          scheduleId: currentSchedule._id,
          startHour: currentSchedule.startHour,
          endHour: currentSchedule.endHour,
          timeUnit: currentSchedule.timeUnit,
          maxWorkersPerShift: currentSchedule.maxWorkersPerShift
        }
      }));
  
      res.json({
        schedule: {
          id: currentSchedule._id,
          startDate: currentSchedule.startDate,
          endDate: currentSchedule.endDate,
          deadline: currentSchedule.deadline,
          timeUnit: currentSchedule.timeUnit,
          startHour: currentSchedule.startHour,
          endHour: currentSchedule.endHour,
          maxWorkersPerShift: currentSchedule.maxWorkersPerShift
        },
        events: calendarEvents
      });
  
    } catch (error) {
      console.error('스케줄 조회 에러:', error);
      res.status(500).json({ 
        message: '서버 에러가 발생했습니다.',
        error: error.message 
      });
    }
  });
  
 

/* // WorkerEvents.js
router.get('/worker/events/apply', async (req, res) => {
    try {
        // workerId를 세션에서 가져옴
        const workerId = req.session.userId;
        
        // Schedule 컬렉션에서 이 worker가 포함된 스케줄을 찾음
        const schedules = await Schedule.find({ 
            workers: workerId 
        }).populate('events');
  
        // FullCalendar 형식으로 이벤트 변환
        const formattedEvents = schedules.flatMap(schedule => {
            return schedule.events.map(event => ({
                id: event._id,
                title: event.title,
                start: event.start,
                end: event.end,
                description: event.description,
                allDay: event.allDay,
                backgroundColor: "#52b2d5",
                extendedProps: {
                    scheduleId: schedule._id,
                    workers: schedule.workers,
                    timeUnit: schedule.timeUnit, 
                    startHour: schedule.startHour,
                    endHour: schedule.endHour,
                    deadline: schedule.deadline
                }
            }));
        });
  
        res.json(formattedEvents);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Failed to retrieve events' });
    }
  }); */


  // 근무 신청 (POST)
  router.post('/apply', async (req, res) => {
    try {
        const { shiftRequests } = req.body;
        const sessionUserId = req.session.userId;

        // 1. Worker 찾기
        const worker = await Worker.findById(sessionUserId);
        console.log('Found worker details:', {
          _id: worker?._id,
          userName: worker?.userName,
          fullWorker: worker
        });
        if (!worker) {
            return res.status(404).json({ message: '근무자 정보를 찾을 수 없습니다.' });
        }

        // 2. ShiftRequest 생성 및 저장
        const requestsToSave = shiftRequests.map(request => {
            // 각 필드가 존재하는지 확인하고 새로운 객체 생성
            if (!request.start || !request.end || !request.lastShiftStart || 
                !request.lastShiftEnd || !request.priority) {
                throw new Error('필수 필드가 누락되었습니다.');
            }

            return {
                workerId: worker._id,        // worker의 _id 추가
                userName: worker.userName,    // worker의 userName 추가
                start: request.start,
                end: request.end,
                lastShiftStart: request.lastShiftStart,
                lastShiftEnd: request.lastShiftEnd,
                status: request.status || 'Pending',
                description: request.description,
                priority: request.priority
            };
        });

        // 3. 데이터 저장
        const savedRequests = await ShiftRequest.insertMany(requestsToSave);

        // 4. 응답 전송
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

// 근무 신청 조회
router.get('/apply/:workerId', async (req, res) => {
    const requests = await ShiftRequest.find({ workerId: req.params.workerId });
    res.json(requests);
});


export default router;
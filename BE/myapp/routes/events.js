// events.js
import express from 'express';
import Event from '../models/Event.js'; // 이벤트 모델 참조 (모델 위치에 따라 경로 조정)

const router = express.Router();

// 이벤트 생성create (GET)
router.get('/create', (req, res) => {
    res.render('createEvent'); // 이벤트 생성 페이지 템플릿을 렌더링
});

// 이벤트 생성create (POST)
router.post('/create', async (req, res) => {
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
router.get('/edit/:id', async (req, res) => {
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
router.post('/edit/:id', async (req, res) => {
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
router.post('/delete/:id', async (req, res) => {
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


//

// 
export default router;

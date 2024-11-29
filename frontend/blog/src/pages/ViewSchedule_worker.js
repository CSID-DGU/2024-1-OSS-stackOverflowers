import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom'; 
import eventsData from './data/event.json';
import koLocale from '@fullcalendar/core/locales/ko';  
import './ViewSchedule.css'

export default function ViewSchedule_worker() {
const calendarEl = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []);

// 이벤트 fetch 함수
const fetchEvents = async () => {
  try {
    if (!startDate || !endDate) {
      setEvents([]);
      return;
    }

    const response = await fetch('/worker/events/all');
    if (!response.ok) {
      throw new Error('스케줄을 불러오는데 실패했습니다.');
    }
    
    const data = await response.json();
    
    const formattedEvents = data.map(event => ({
      id: event._id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      description: event.description,
      allDay: event.allDay,
      backgroundColor: "#52b2d5"
    }));
    
    setEvents(formattedEvents);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching events:', error);
    setError(error.message);
    setLoading(false);
  }
};
  
return (
    <>
    <div className="schedule-view-container">
      {/* 네비게이션 바 */}
      <header className="navbar">
        <div className="logo_home">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li><button className="main-button" onClick={() => { window.location.href = '/worker/main'; }}>홈</button></li>
            <li><button className="main-button" onClick={() => navigate('/worker/events/apply')}>근무표 작성</button></li>
            <li><button className="main-button" onClick={() => navigate('/worker/events/all')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button onClick={() => navigate('/home')}>로그아웃</button>
        </div>
      </header>
      <h1>근무표 조회</h1>
      {/* 메인 컨텐츠 */}
      <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
        <FullCalendar
          ref={calendarEl}
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          height="80%"
          headerToolbar={{
            left: '',
            center: 'title',
            right:'prev,next'
          }}
          locale={koLocale}
          slotDuration="00:30:00"
          events={fetchEvents}
          allDaySlot={false}
        />
      </div>
      </div>
    </>
  );
}


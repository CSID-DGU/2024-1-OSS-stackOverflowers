import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom'; 
import koLocale from '@fullcalendar/core/locales/ko';  
import './ViewSchedule.css'

export default function ViewSchedule_worker() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/worker/events/all');
        if (!response.ok) {
          throw new Error('근무표 조회에 실패했습니다.');
        }
  
        const data = await response.json();
  
        // 시간대별 가장 최신 이벤트를 저장하기 위한 배열
        const uniqueEvents = [];
  
        // 배열을 뒤집어서 최신 이벤트부터 처리
        data.reverse().forEach((event) => {
          const eventStart = new Date(event.start).getTime();
          const eventEnd = new Date(event.end).getTime();
  
          // 현재 이벤트와 겹치는 시간대의 이벤트가 이미 있는지 확인
          const isOverlap = uniqueEvents.some(
            (e) =>
              eventStart < new Date(e.end).getTime() && eventEnd > new Date(e.start).getTime()
          );
  
          // 겹치는 이벤트가 없을 경우에만 추가
          if (!isOverlap) {
            uniqueEvents.push({
              id: event._id,
              title: event.title,
              start: event.start,
              end: event.end,
              backgroundColor: "#52b2d5",
              description: event.description,
              allDay: event.allDay || false,
              extendedProps: {
                workers: event.workers,
              },
            });
          }
        });
  
        setEvents(uniqueEvents);
      } catch (error) {
        console.error('근무표 조회 중 오류 발생:', error);
        alert('근무표를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSchedule();
  }, []);
  

  return (
    <>
      <div className="schedule-view-container">
        <header className="navbar">
          <div className="logo_home">ShiftMate</div>
          <nav>
            <ul className="nav-links">
              <li><button className="main-button" onClick={() => { window.location.href = '/worker/main'; }}>홈</button></li>
              <li><button className="main-button" onClick={() => navigate('/worker/events/apply')}>근무표 신청</button></li>
              <li><button className="main-button" onClick={() => navigate('/worker/events/all')}>근무표 조회</button></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
        </header>
        <h1>근무표 조회</h1>
        
        <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            <FullCalendar
              ref={calendarEl}
              plugins={[timeGridPlugin]}
              initialView="timeGridWeek"
              height="80%"
              headerToolbar={{
                left: '',
                center: 'title',
                right: 'prev,next'
              }}
              locale={koLocale}
              slotDuration="00:30:00"
              events={events}
              allDaySlot={false}
              eventContent={(eventInfo) => {
                return (
                  <>
                    <div>{eventInfo.event.title}</div>
                    {eventInfo.event.extendedProps.workers && (
                      <div>근무자: {eventInfo.event.extendedProps.workers.join(', ')}</div>
                    )}
                  </>
                )
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
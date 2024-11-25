import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom';
import eventsData from './data/event.json';
import koLocale from '@fullcalendar/core/locales/ko';
import './ModifySchedule.css'

export default function ModifySchedule() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []);

  const handleSave = () => {
    // 저장 로직 구현
    console.log('Schedule saved');
    // 필요한 저장 로직 추가
    navigate('/admin/events/all');
  };

  // 커스텀 버튼 렌더링 함수
  const renderSaveButton = () => {
    return {
      text: '저장',
      click: handleSave,
      className: 'fc-button-primary'
    };
  };

  const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
    try {
      const events = eventsData.map(event => ({
        title: `${event.worker}`,
        start: event.startTime,
        end: event.endTime,
        backgroundColor: "#52b2d5"
      }));
      
      successCallback(events);
    } catch (error) {
      console.error('Failed to load events:', error);
      failureCallback(error);
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
              <li><button className="main-button" onClick={() => navigate('/worker/events/create')}>근무표 생성</button></li>
              <li><button className="main-button" onClick={() => navigate('/worker/events/all')}>근무표 조회</button></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
        </header>
        <h1>근무표 수정</h1>
        {/* 메인 컨텐츠 */}
        <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
          <FullCalendar
            ref={calendarEl}
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            height="80%"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'saveButton,prev,next'  // 기존 버튼들과 함께 저장 버튼 추가
            }}
            customButtons={{
              saveButton: renderSaveButton()  // 커스텀 버튼 정의
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
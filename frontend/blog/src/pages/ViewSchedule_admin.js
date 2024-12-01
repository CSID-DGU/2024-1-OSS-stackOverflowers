import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom';
import eventsData from './data/event.json';
import koLocale from '@fullcalendar/core/locales/ko';
import './ModifySchedule.css'

export default function ViewSchedule_admin() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []);

  const handlerender = () => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      const currentRange = calendarApi.view.activeStart; // 현재 주간의 시작 날짜
      navigate('/admin/events/edit', { state: { start: currentRange } });
    }
  };

  // 커스텀 버튼 렌더링 함수
  const renderSaveButton = () => {
    return {
      text: '수정',
      click: handlerender,
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
              <li><button className="main-button" onClick={() => { window.location.href = '/home'; }}>홈</button></li>
              <li><button className="main-button" onClick={() => navigate('/admin/events/create')}>근무표 생성</button></li>
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
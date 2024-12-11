import React, { useRef, useEffect, useState } from 'react';
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
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
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
  
    fetchEvents();
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

  /* const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
    try {
      const events = eventsData.map(event => ({
        title: event.title,
        workers: event.workers,
        backgroundColor: "#52b2d5"
      }));
      
      successCallback(events);
    } catch (error) {
      console.error('Failed to load events:', error);
      failureCallback(error);
    }
  }; */

  return (
    <>
      <div className="schedule-view-container">
        {/* 네비게이션 바 */}
        <header className="navbar">
          <div className="logo_home">ShiftMate</div>
          <nav>
            <ul className="nav-links">
              <li><button className="main-button" onClick={() => { window.location.href = '/admin/main'; }}>홈</button></li>
              <li><button className="main-button" onClick={() => navigate('/admin/events/create')}>근무표 생성</button></li>
              <li><button className="main-button" onClick={() => navigate('/admin/events/all')}>근무표 조회</button></li>
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
              right: 'saveButton,prev,next'  // 기존 버튼들과 함께 저장 버튼 추가
            }}
            customButtons={{
              saveButton: renderSaveButton()  // 커스텀 버튼 정의
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
        </div>
      </div>
    </>
  );
}
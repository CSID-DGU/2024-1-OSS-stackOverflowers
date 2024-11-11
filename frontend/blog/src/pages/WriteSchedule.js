import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import eventsData from './data/event.json';
import './WriteSchedule.css';
import { useNavigate } from 'react-router-dom';
import koLocale from '@fullcalendar/core/locales/ko';

export default function WriteSchedule() {
  const calendarEl = useRef(null);
  const [events, setEvents] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [appliedEvents, setAppliedEvents] = useState({});
  const navigate = useNavigate();

// useEffect 부분 수정
useEffect(() => {
  const loadEvents = () => {
    const fetchedEvents = eventsData.map((event) => ({
      id: `${event.startTime}-${event.endTime}`,
      title: event.name,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      backgroundColor: '#FFFFFF',    // 기본 흰색 배경
      textColor: '#000000',         // 검정색 텍스트
      borderColor: '#d1d1d1'        // 회색 테두리
    }));
    setEvents(fetchedEvents);
  };
  loadEvents();
}, []);

// updateEventStatus 함수 수정
const updateEventStatus = (eventId, priority = null) => {
  setEvents(prevEvents =>
    prevEvents.map(event => {
      if (event.id === eventId) {
        const originalName = event.title.split(' (')[0];
        let backgroundColor;
        let textColor;
        
        // 더 뚜렷한 색상 차이를 준 우선순위별 색상
        switch(priority) {
          case '1순위':
            backgroundColor = '#023c52'; // 매우 진한 파랑
            textColor = '#FFFFFF';
            break;
          case '2순위':
            backgroundColor = '#0094c9'; // 선명한 파랑
            textColor = '#FFFFFF';
            break;
          case '3순위':
            backgroundColor = '#b7ecff'; // 밝은 파랑
            textColor = '#000000';       // 밝은 배경색에는 검정색 텍스트
            break;
          default:
            backgroundColor = '#FFFFFF'; // 흰색 배경
            textColor = '#000000';      // 검정색 텍스트
            break;
        }

        return {
          ...event,
          backgroundColor,
          textColor,
          title: priority ? `${originalName} (${priority})` : originalName,
          borderColor: '#d1d1d1'
        };
      }
      return event;
    })
  );

  if (priority) {
    setAppliedEvents(prev => ({ ...prev, [eventId]: priority }));
  } else {
    setAppliedEvents(prev => {
      const newState = { ...prev };
      delete newState[eventId];
      return newState;
    });
  }
};

  const openCancelPopup = (event) => {
    const popupWidth = 400;
    const popupHeight = 300;
    const left = window.screenX + (window.innerWidth - popupWidth) / 2;
    const top = window.screenY + (window.innerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      '',
      '_blank',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no`
    );

    popupWindow.document.write(`
      <html>
        <head>
          <title>신청 취소</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #fff;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            button {
              margin-top: 10px;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>신청을 취소하시겠습니까?</h2>
          <p>시작 시간: ${event.start.toLocaleString()}</p>
          <p>종료 시간: ${event.end.toLocaleString()}</p>
          <p>현재 우선순위: ${appliedEvents[event.id]}</p>
          <div style="margin-top: 20px;">
            <button id="confirm">확인</button>
            <button id="cancel">취소</button>
          </div>
          <script>
            document.getElementById('confirm').onclick = () => {
              window.opener.postMessage({ 
                type: 'CANCEL_APPLICATION',
                eventId: '${event.id}'
              }, '*');
              window.close();
            };
            document.getElementById('cancel').onclick = () => {
              window.close();
            };
          </script>
        </body>
      </html>
    `);
  };

  const openApplyPopup = (event) => {
    if (!selectedOption) {
      alert('우선순위를 선택해주세요.');
      return;
    }

    const popupWidth = 400;
    const popupHeight = 300;
    const left = window.screenX + (window.innerWidth - popupWidth) / 2;
    const top = window.screenY + (window.innerHeight - popupHeight) / 2;

    const popupWindow = window.open(
      '',
      '_blank',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=no`
    );

    popupWindow.document.write(`
      <html>
        <head>
          <title>근무 신청</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #fff;
              font-family: Arial, sans-serif;
              text-align: center;
            }
            button {
              margin-top: 10px;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>근무 신청</h2>
          <p>시작 시간: ${event.start.toLocaleString()}</p>
          <p>종료 시간: ${event.end.toLocaleString()}</p>
          <p>우선 순위: ${selectedOption}</p>
          <div style="margin-top: 20px;">
            <button id="confirm">예</button>
            <button id="cancel">아니오</button>
          </div>
          <script>
            document.getElementById('confirm').onclick = () => {
              window.opener.postMessage({ 
                type: 'CONFIRM_APPLICATION',
                eventId: '${event.id}',
                priority: '${selectedOption}'
              }, '*');
              window.close();
            };
            document.getElementById('cancel').onclick = () => {
              window.close();
            };
          </script>
        </body>
      </html>
    `);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'CONFIRM_APPLICATION') {
        updateEventStatus(event.data.eventId, event.data.priority);
      } else if (event.data.type === 'CANCEL_APPLICATION') {
        updateEventStatus(event.data.eventId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleEventClick = (info) => {
    const event = info.event;
    if (appliedEvents[event.id]) {
      openCancelPopup(event);
    } else {
      openApplyPopup(event);
    }
  };

  const handleSlotClick = (info) => {
    const clickedTime = info.date;
    const clickedEvent = events.find(
      (event) => clickedTime >= event.start && clickedTime < event.end
    );

    if (clickedEvent) {
      if (appliedEvents[clickedEvent.id]) {
        openCancelPopup(clickedEvent);
      } else {
        openApplyPopup(clickedEvent);
      }
    } else {
      console.log('No event found in this time slot.');
    }
  };

  return (
    <>
    <div className="schedule-write-container">
      <header className="navbar">
        <div className="logo_home">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li><button className="main-button" onClick={() => { window.location.href = '/home'; }}>홈</button></li>
            <li><button className="main-button" onClick={() => navigate('/admin/events/create')}>근무표 생성</button></li>
            <li><button className="main-button" onClick={() => navigate('/worker/events/apply')}>근무표 작성</button></li>
            <li><button className="main-button" onClick={() => navigate('/worker/events/all')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button onClick={() => navigate('/home')}>로그아웃</button>
        </div>
      </header>
      <h1>근무표 작성</h1>

      {/* 메인 컨텐츠 */}
        <div className="write_main-content">
          <div className="priority_dropdown"> 
              <label htmlFor="scheduleDropdown">우선순위:</label>
              <select
                id="scheduleDropdown"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ width: '100%', marginTop: '10px', marginLeft: '3px', padding: '8px', height: '40px' }}
              >
                <option value="">근무시간 우선순위</option>
                <option value="1순위">1순위</option>
                <option value="2순위">2순위</option>
                <option value="3순위">3순위</option>
              </select>
          </div>
  
            <div classname = "write_calendar-container">
              <FullCalendar
                ref={calendarEl}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  center: '',
                  left: 'title',
                }}
                slotDuration="00:30:00"
                events={events}
                allDaySlot={false}
                dateClick={handleSlotClick}
                eventClick={handleEventClick}
                locale={koLocale}
                nowIndicator={false}
              />
            </div>
        </div>
    </div>
    </>
  );
}  
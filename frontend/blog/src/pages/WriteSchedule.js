import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import eventsData from './data/event.json';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom';

export default function WriteSchedule() {
  const calendarEl = useRef(null);
  const [events, setEvents] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [appliedEvents, setAppliedEvents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = () => {
      const fetchedEvents = eventsData.map((event) => ({
        id: `${event.startTime}-${event.endTime}`,
        title: event.name,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        backgroundColor: '#3788d8',
        textColor: '#ffffff',
      }));
      setEvents(fetchedEvents);
    };
    loadEvents();
  }, []);

  const updateEventStatus = (eventId, priority = null) => {
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === eventId) {
          const originalName = event.title.split(' (')[0];
          return {
            ...event,
            backgroundColor: priority ? '#808080' : '#3788d8',
            textColor: '#ffffff',
            title: priority ? `${originalName} (${priority})` : originalName,
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
      <header className="navbar">
        <div className="logo_home">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li><button className="main-button" onClick={() => { window.location.href = '/home'; }}>홈</button></li>
            <li><button className="main-button" onClick={() => navigate('/create')}>근무표 생성</button></li>
            <li><button className="main-button" onClick={() => navigate('/write')}>근무표 작성</button></li>
            <li><button className="main-button" onClick={() => navigate('/view')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')}>로그인</button>
          <button onClick={() => navigate('/signup')}>회원가입</button>
        </div>
      </header>

      <div className="main-content">
        <div style={{ display: 'flex', height: '90vh', width: '90vh', margin: '0 auto' }}>
          <div style={{ width: '180px', padding: '10px' }}>
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

          <div style={{ flex: 1, paddingLeft: '10px', width: '100%' }}>
            <FullCalendar
              ref={calendarEl}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{ center: 'title' }}
              slotDuration="00:30:00"
              events={events}
              height={"80%"}
              width={"80%"}
              dateClick={handleSlotClick}
              eventClick={handleEventClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
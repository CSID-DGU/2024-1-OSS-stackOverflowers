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
  // 우선순위별 신청 횟수를 추적하기 위한 상태 추가
  const [priorityCounts, setPriorityCounts] = useState({
    '1순위': 0,
    '2순위': 0,
    '3순위': 0
  });
  const navigate = useNavigate();
 
// useEffect 부분 수정
useEffect(() => {
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/worker/events/apply');
      
      if (!response.ok) {
        throw new Error('근무 일정을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      
      const formattedEvents = data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        backgroundColor: '#FFFFFF',    // 기본 흰색 배경
        textColor: '#000000',         // 검정색 텍스트
        borderColor: '#d1d1d1',       // 회색 테두리
        description: event.description,
        allDay: event.allDay,

      }));

      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  fetchEvents();
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

  // 근무 신청 조건 확인 함수
  const validateScheduleApplications = () => {
    // 우선순위별 신청 횟수 계산
    const priorityApplications = Object.values(appliedEvents).reduce((acc, priority) => {
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const errors = [];

    // 1순위 확인
    if (!priorityApplications['1순위'] || priorityApplications['1순위'] !== 1) {
      errors.push('1순위 근무를 신청해주세요.');
    }

    // 2순위 확인 (정확히 1개)
    else if (!priorityApplications['2순위'] || priorityApplications['2순위'] !== 1) {
      errors.push('2순위 근무를 신청해주세요.');
    }

    // 3순위 확인 (1개 이상)
    else if (!priorityApplications['3순위'] || priorityApplications['3순위'] < 1) {
      errors.push('3순위 근무를 신청해주세요.');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // 저장 버튼 핸들러
  const handleSaveSchedule = async () => {
    try {
      // 근무 신청 조건 확인
      const validation = validateScheduleApplications();
      
      if (!validation.isValid) {
        alert(`${validation.errors.join('\n')}`);
        return;
      }

      // appliedEvents에서 신청된 근무 일정 데이터 추출
      const scheduleData = Object.entries(appliedEvents).map(([eventId, priority]) => {
        const event = events.find(e => e.id === eventId);
        return {
          start: event.start,
          end: event.end,
          priority: priority
        };
      });

      const response = await fetch('/worker/events/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleData }),
      });

      if (!response.ok) {
        throw new Error('근무 신청 저장에 실패했습니다.');
      }

      const result = await response.json();
      alert('근무 신청이 완료되었습니다.');
      //navigate('/worker/events/all'); // 저장 후 조회 페이지로 이동
    } catch (error) {
      console.error('Save error:', error);
      alert(error.message);
    }
  };


    // 저장 버튼 렌더링 함수
    const renderSaveButton = () => {
      return {
        text: '저장',
        click: handleSaveSchedule,
        className: 'fc-button-primary'
      };
    };
  

  // 우선순위 제한 확인 함수
  const checkPriorityLimit = (priority) => {
    if (priority === '1순위' && priorityCounts['1순위'] >= 1) {
      alert('1순위는 한 번만 신청할 수 있습니다.');
      return false;
    }
    if (priority === '2순위' && priorityCounts['2순위'] >= 1) {
      alert('2순위는 한 번만 신청할 수 있습니다.');
      return false;
    }
    return true;
  };

  const updateEventStatus = (eventId, priority = null) => {
    // 이벤트 삭제 시
    if (!priority) {
      const oldPriority = appliedEvents[eventId];
      if (oldPriority) {
        setPriorityCounts(prev => ({
          ...prev,
          [oldPriority]: prev[oldPriority] - 1
        }));
      }
    }

    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === eventId) {
          const originalName = event.title.split(' (')[0];
          let backgroundColor;
          let textColor;
          
          switch(priority) {
            case '1순위':
              backgroundColor = '#023c52';
              textColor = '#FFFFFF';
              break;
            case '2순위':
              backgroundColor = '#0094c9';
              textColor = '#FFFFFF';
              break;
            case '3순위':
              backgroundColor = '#b7ecff';
              textColor = '#000000';
              break;
            default:
              backgroundColor = '#FFFFFF';
              textColor = '#000000';
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

    // 우선순위 제한 확인
    if (!checkPriorityLimit(selectedOption)) {
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
        // 신청 확인 시 우선순위 카운트 증가
        setPriorityCounts(prev => ({
          ...prev,
          [event.data.priority]: prev[event.data.priority] + 1
        }));
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
              <li><button className="main-button" onClick={() => navigate('/worker/events/apply')}>근무표 신청</button></li>
              <li><button className="main-button" onClick={() => navigate('/worker/events/all')}>근무표 조회</button></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
        </header>
        <h1>근무표 신청</h1>

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

          <div className="write_calendar-container">
            <FullCalendar
              ref={calendarEl}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: '',
                center: 'title',
                right: 'saveButton,prev,next' // 저장 버튼 추가
              }}
              customButtons={{
                saveButton: renderSaveButton() // 커스텀 버튼 정의
              }}
              slotDuration="00:30:00"
              events={events}
              allDaySlot={false}
              dateClick={handleSlotClick}
              eventClick={handleEventClick}
              locale={koLocale}
              nowIndicator={false}
              height={550}
            />
          </div>
        </div>
      </div>
    </>
  );
}
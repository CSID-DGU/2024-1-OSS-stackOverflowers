import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 인터랙션 플러그인
import eventsData from './data/event.json'; // JSON 파일

export default function WriteSchedule() {
  const calendarEl = useRef(null);
  const [events, setEvents] = useState([]); // 외부 데이터로부터 불러온 이벤트

  // JSON 데이터를 불러와서 상태에 저장
  useEffect(() => {
    const loadEvents = () => {
      const fetchedEvents = eventsData.map((event) => ({
        title: event.name,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
      }));
      setEvents(fetchedEvents); // 이벤트 저장
    };
    loadEvents(); // 이벤트 로드
  }, []);

  const openPopup = (event) => {
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
          <div style="margin-top: 20px;">
            <button id="confirm">예</button>
            <button id="cancel">아니오</button>
          </div>
          <script>
            document.getElementById('confirm').onclick = () => {
              console.log('신청 완료되었습니다.');
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

  // **이벤트를 클릭했을 때 호출**
  const handleEventClick = (info) => {
    console.log('Event clicked:', info.event);
    openPopup(info.event); // 팝업 열기
  };

  // **빈 타임 슬롯을 클릭했을 때 호출**
  const handleSlotClick = (info) => {
    console.log('Time slot clicked:', info.date);

    const clickedTime = info.date;
    const clickedEvent = events.find(
      (event) => clickedTime >= event.start && clickedTime < event.end
    );

    if (clickedEvent) {
      console.log('Event found:', clickedEvent);
      openPopup(clickedEvent); // 팝업 열기
    } else {
      console.log('No event found in this time slot.');
    }
  };

  return (
    <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
      <FullCalendar
        ref={calendarEl}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="80%"
        headerToolbar={{ center: 'title' }}
        slotDuration="00:30:00"
        events={events}
        dateClick={handleSlotClick}
        eventClick={handleEventClick}
      />
    </div>
  );
}

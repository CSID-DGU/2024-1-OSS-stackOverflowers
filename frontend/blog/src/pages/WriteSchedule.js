import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import eventsData from './data/event.json';
import './nav_schedule.css';

export default function WriteSchedule() {
  const calendarEl = useRef(null);
  const [events, setEvents] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    const loadEvents = () => {
      const fetchedEvents = eventsData.map((event) => ({
        title: event.name,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
      }));
      setEvents(fetchedEvents);
    };
    loadEvents();
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
           <p>우선 순위: ${selectedOption ? selectedOption : '설정되지 않음'}</p>
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

  const handleEventClick = (info) => {
    console.log('Event clicked:', info.event);
    openPopup(info.event);
  };

  const handleSlotClick = (info) => {
    console.log('Time slot clicked:', info.date);

    const clickedTime = info.date;
    const clickedEvent = events.find(
      (event) => clickedTime >= event.start && clickedTime < event.end
    );

    if (clickedEvent) {
      console.log('Event found:', clickedEvent);
      openPopup(clickedEvent);
    } else {
      console.log('No event found in this time slot.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '90vh', width: '90vh', margin: '0 auto' }}>
      {/* Left Dropdown Menu */}
      <div style={{ width: '180px', padding: '10px' }}>
        <label htmlFor="scheduleDropdown">우선순위:</label>
        <select
          id="scheduleDropdown"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          style={{ width: '100%', marginTop: '10px', marginLeft: '3px' ,padding: '8px', height: '40px' }}
        >
          <option value="">근무시간 우선순위</option>
          <option value="1순위">1순위</option>
          <option value="2순위">2순위</option>
          <option value="3순위">3순위</option>
        </select>
      </div>

      {/* Calendar */}
        <div style={{ flex: 1, paddingLeft: '10px', width: '100%' }}>
    <FullCalendar
      ref={calendarEl}
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"    // 세로 크기 100%
         // 가로 크기 100%
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
  );
}

import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import eventsData from './data/event.json'; // src 경로에서 파일을 import
export default function ViewSchedule() {
  const calendarEl = useRef(null);

  useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []);

  const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
    try {
      const events = eventsData.map(event => ({
        title: event.name,
        start: event.startTime,
        end: event.endTime,
      }));
  
      successCallback(events);
    } catch (error) {
      console.error('Failed to load events:', error);
      failureCallback(error);
    }
  };
  
  return (
    <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
      <FullCalendar
        ref={calendarEl}
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        height="80%"
        headerToolbar={{
          center: 'title',
        }}
        slotDuration="00:30:00"
        events={fetchEvents} 
      />
    </div>
  );
}

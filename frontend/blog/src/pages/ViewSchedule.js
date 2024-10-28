import React, { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';


export default function ViewSchedule() {
  const calendarEl = useRef(null);

  useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []);

  return (
    <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
      <FullCalendar
        ref={calendarEl}
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        height="80%" // 부모 요소에 맞게 확장
        headerToolbar={{
          center: 'title',
        }}
      />
    </div>
  );
}

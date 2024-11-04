import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CreateSchedule = () => {
  const [events, setEvents] = useState([]);
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("23:00");
  const [timeUnit, setTimeUnit] = useState(1); // 기본값을 1시간으로 설정
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const calendarRef = useRef(null);

  const handleEventAdd = (selectInfo) => {
    const title = prompt("새 이벤트 제목을 입력하세요:");
    if (title) {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: selectInfo.start,
        end: selectInfo.end,
        allDay: false,
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  };

  const handleEventRemove = (clickInfo) => {
    if (window.confirm("이 이벤트를 삭제하시겠습니까?")) {
      clickInfo.event.remove();
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== clickInfo.event.id)
      );
    }
  };

  const handleReset = () => {
    setEvents([]);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  useEffect(() => {
    if (calendarRef.current && startDate && endDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(startDate);
      calendarApi.setOption("visibleRange", {
        start: startDate,
        end: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString().split("T")[0],
      });
    }
  }, [startDate, endDate]);

  return (
    <div className="schedule-create-container">
      <h1>근무표 생성</h1>
      <p>근무 시작 시간, 종료 시간, 시간 단위를 설정하세요.</p>

      <div className="time-setting">
        <label>
          시작일:
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </label>

        <label>
          종료일:
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </label>

        <label>
          근무 시작 시간:
          <select
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
          >
            {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>

        <label>
          근무 종료 시간:
          <select value={endHour} onChange={(e) => setEndHour(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>

        <label>
          시간 단위:
          <select value={timeUnit} onChange={(e) => setTimeUnit(Number(e.target.value))}>
            <option value={1}>1시간</option>
            <option value={0.5}>30분</option>
          </select>
        </label>

        <button onClick={handleReset} className="reset-button">
          초기화
        </button>
      </div>

      <div className="calendar-container">
        {startDate && endDate ? (
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={true}
            editable={true}
            events={events}
            headerToolbar={{
              left: "",
              center: "title",
              right: "",
            }}
            slotMinTime={startHour} // 시작 시간
            slotMaxTime={endHour} // 종료 시간
            slotDuration={`${timeUnit === 1 ? "01:00" : "00:30"}`} // 시간 단위
            slotLabelInterval="00:30:00"
            allDaySlot={false}
            select={handleEventAdd}
            eventClick={handleEventRemove}
            initialDate={startDate}
            visibleRange={{
              start: startDate,
              end: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)).toISOString().split("T")[0],
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false, // 24시간 형식
            }}
            height="auto" // 높이를 자동으로 조절
          />
        ) : (
          <p>캘린더를 보기 위해 시작일과 종료일을 모두 선택하세요.</p>
        )}
      </div>
    </div>
  );
};

export default CreateSchedule;

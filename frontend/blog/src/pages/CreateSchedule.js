import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import './nav_schedule.css';
import './CreateSchedule.css'

const CreateSchedule = () => {
  const [events, setEvents] = useState([]);
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("23:00");
  const [timeUnit, setTimeUnit] = useState(1); // 기본값을 1시간으로 설정
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workerId, setWorkerId] = useState(""); // 근무자 ID 입력 상태
  const [workers, setWorkers] = useState([]); // 근무자 목록
  const [deadline, setDeadline] = useState("");
  const calendarRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSaveSchedule = () => {
    // 저장할 근무표 데이터
    const scheduleData = {
      events,
      startHour,
      endHour,
      timeUnit,
      startDate,
      endDate,
      workers,
      deadline,
    };
    localStorage.setItem("scheduleData", JSON.stringify(scheduleData));
    alert("근무표가 저장되었습니다.");

    setEvents([]);
    setStartHour("09:00");
    setEndHour("23:00");
    setTimeUnit(1);
    setStartDate("");
    setEndDate("");
    setWorkers([]);
    setDeadline("");

  }; 
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value); // 작성 기한 변경
  };

  const handleWorkerAdd = () => {
    if (workerId && !workers.includes(workerId)) {
      setWorkers((prevWorkers) => [...prevWorkers, workerId]);
      setWorkerId(""); // 입력 필드 초기화
    } else {
      alert("중복된 근무자 ID거나 빈 값을 입력했습니다.");
    }
  };

  const handleWorkerRemove = (id) => {
    setWorkers((prevWorkers) => prevWorkers.filter((worker) => worker !== id));
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
          <button onClick={() => navigate('/Home')}>로그아웃</button>
        </div>
      </header>
      <h1>근무표 생성</h1>

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
        <button onClick={handleSaveSchedule} className="save-button">
          설정 저장
        </button>
      </div>

      <div className="calendar-container">
        {startDate && endDate ? (
          <>
            <div className="deadline-container">
              <label htmlFor="deadline">작성기한: </label>
              <input type="date" id="deadline" name="deadline" />
            </div>
            <div className="calendar">
              <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGrid"
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
            </div>

            <div className="worker-section">
              <label>
                근무자 ID:
                <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value)} placeholder="근무자 ID 입력"/>
              </label>
              <button onClick={handleWorkerAdd} className="add-worker-button">
                근무자 추가
              </button>

              <div className="worker-list">
                <h3>추가된 근무자</h3>
                <ul>
                  {workers.map((worker) => (
                    <li key={worker}>
                      {worker} <button onClick={() => handleWorkerRemove(worker)}>삭제</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p>시작일과 종료일을 모두 선택하세요.</p>
        )}
      </div>  
    </div>
  );
};

export default CreateSchedule;

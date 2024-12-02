import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import './nav_schedule.css';
import './CreateSchedule.css'
import koLocale from '@fullcalendar/core/locales/ko';

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

  //로그아웃 함수 추가
  // 로그아웃 처리 함수 추가
  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message); // "로그아웃 되었습니다."
        setTimeout(() => {
          navigate('/home');
        }, 100); 
      } else {
        alert('로그아웃 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  const handleEventAdd = (selectInfo) => {
    const title = prompt("근무명을 입력하세요:");
    if (title) {
      const newEvent = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: false,
        backgroundColor: "#52b2d5"
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  };

  const handleEventRemove = (clickInfo) => {
    if (window.confirm("이 근무를 삭제하시겠습니까?")) {
      clickInfo.event.remove();
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== clickInfo.event.id)
      );
    }
  };

  const handleReset = () => {
    setEvents([]);
  };


  const handleSaveSchedule = async() => {
    // 저장할 근무표 데이터
    try {
      //신청기한 및 근무자 설정이 완료되어야지만 저장할 수 있게 함
      if (!deadline) {
        if (workers.length === 0) {
          alert("신청 기한과 근무자를 설정해주세요.");
          return;
        }
        alert("신청 기한을 설정해주세요.");
        return;
      }
  
      if (workers.length === 0) {
        alert("근무표를 신청할 수 있는 근무자 아이디를 추가해주세요.");
        return;
      // deadline이 없는 경우 endDate를 deadline으로 사용
      const scheduleDeadline = deadline || endDate;  
      if (!scheduleDeadline) {
        throw new Error('작성 기한을 설정해주세요.');
      }
      const scheduleData = {
        events: events.map(event => ({   //모든 이벤트들을 SchedulData로 저장
          title: event.title,
          start: event.start.toLocaleString(),
          end: event.end.toLocaleString(),
          allDay: event.allDay || false,
        })),
        startHour,
        endHour,
        timeUnit,
        startDate,
        endDate,
        workers,
        deadline: new Date(scheduleDeadline).getTime()  // 수정된 부분
      };
      const response = await fetch('/admin/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '근무표 저장에 실패했습니다.');
      }
  
      alert("근무표가 저장되었습니다.");
      setEvents([]);
      setStartHour("09:00");
      setEndHour("23:00");
      setTimeUnit(1);
      setStartDate("");
      setEndDate("");
      setWorkers([]);
      setDeadline("");
      
    } catch (error) {
      console.error('Schedule save error:', error);
      alert(error.message);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    const newDeadline = e.target.value;
  
    // `deadline`이 `startDate`보다 늦으면 경고를 띄우고 초기화
    if (new Date(newDeadline) >= new Date(startDate)) {
      alert("신청 기한은 시작일보다 빠른 날짜여야 합니다.");
      setDeadline(""); // `deadline` 초기화
    } else {
      setDeadline(newDeadline); // 유효한 경우에만 업데이트
    }
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
            <li><button className="main-button" onClick={() => navigate('/admin/events/all')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button onClick={handleLogout}>로그아웃</button>
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
            {Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2, '0')}:00`).map((hour) => (
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

      <div className="create_calendar-container">
        {startDate && endDate ? (
          <>
            <div className="create_calendar">
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
                height="90%" // 높이를 자동으로 조절
                locale={koLocale}
              />
            </div>

            <div className="worker-section">
              <label>
                근무자 ID:
                <input type="text" value={workerId} onChange={(e) => setWorkerId(e.target.value)} placeholder="근무자 ID 입력"/>
              </label>
              <button onClick={handleWorkerAdd} className="add-worker-button">
                추가
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
            <div className="deadline-container">
              <label htmlFor="deadline">신청기한: </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={deadline}
                  onChange={handleDeadlineChange} // 함수 연결
                />
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
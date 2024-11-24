import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { useNavigate } from "react-router-dom";
import "./ModifySchedule.css";
import "./nav_schedule.css";

export default function ModifySchedule() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]); // 현재 표시되는 이벤트 데이터
  const [scheduleList, setScheduleList] = useState([]); // 로컬스토리지의 모든 근무표 데이터
  const [currentRange, setCurrentRange] = useState({ start: null, end: null }); // 현재 캘린더 범위

  useEffect(() => {
    // 로컬스토리지에서 데이터 불러오기
    const storedData = JSON.parse(localStorage.getItem("scheduleData")) || [];
    console.log("Loaded scheduleData from localStorage:", storedData);

    if (Array.isArray(storedData) && storedData.length > 0) {
      setScheduleList(storedData);
    } else {
      console.warn("No valid schedule data found in localStorage.");
      setScheduleList([]);
    }
  }, []);

  // 현재 범위와 일치하는 근무표 데이터를 불러오는 함수
  const loadEventsForCurrentRange = (range) => {
    if (!range.start || !range.end || scheduleList.length === 0) return;

    const matchingSchedule = scheduleList.find(
      (schedule) =>
        new Date(schedule.startDate) <= new Date(range.end) &&
        new Date(schedule.endDate) >= new Date(range.start)
    );

    if (matchingSchedule) {
      setEvents(matchingSchedule.events || []);
    } else {
      setEvents([]); // 해당 범위에 맞는 근무표가 없으면 빈 배열
    }
  };

  useEffect(() => {
    // currentRange가 변경될 때마다 해당 범위에 맞는 근무표 데이터 로드
    loadEventsForCurrentRange(currentRange);
  }, [currentRange, scheduleList]);

  const handleEventAdd = (selectInfo) => {
    const title = prompt("근무명을 입력하세요:");
    if (title) {
      const newEvent = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: "#52b2d5",
      };

      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  };

  const handleEventRemove = (clickInfo) => {
    if (window.confirm(`${clickInfo.event.title} 일정을 삭제하시겠습니까?`)) {
      const eventId = clickInfo.event.id;

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      clickInfo.event.remove();
    }
  };

  const handleReset = () => {
    if (window.confirm("모든 근무 일정을 초기화하시겠습니까?")) {
      setEvents([]);
    }
  };

  const renderResetButton = () => {
    return {
      text: "초기화",
      click: handleReset,
      className: "fc-button-primary",
    };
  };

  const handleSaveSchedule = () => {
    // 현재 범위에 해당하는 근무표 업데이트
    const updatedScheduleList = scheduleList.map((schedule) =>
      new Date(schedule.startDate) <= new Date(currentRange.end) &&
      new Date(schedule.endDate) >= new Date(currentRange.start)
        ? { ...schedule, events }
        : schedule
    );

    localStorage.setItem("scheduleData", JSON.stringify(updatedScheduleList));
    setScheduleList(updatedScheduleList);
    alert("근무표가 저장되었습니다.");
    navigate("/admin/events/all");
  };

  const renderSaveButton = () => {
    return {
      text: "저장",
      click: handleSaveSchedule,
      className: "fc-button-primary",
    };
  };

  return (
    <div className="schedule-modify-container">
      <header className="navbar">
        <div className="logo_home">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li>
              <button className="main-button" onClick={() => navigate("/home")}>
                홈
              </button>
            </li>
            <li>
              <button
                className="main-button"
                onClick={() => navigate("/admin/events/create")}
              >
                근무표 생성
              </button>
            </li>
            <li>
              <button
                className="main-button"
                onClick={() => navigate("/admin/events/all")}
              >
                근무표 조회
              </button>
              
            </li>
          </ul>
        </nav>
        <div className="auth-buttons">
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
      </header>

      <h1>근무표 수정</h1>

      <div className="modify-calendar-container">
        <FullCalendar
          ref={calendarEl}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={koLocale}
          selectable={true}
          editable={true}
          events={events}
          select={(selectInfo) => {
            handleEventAdd(selectInfo);
            calendarEl.current.getApi().unselect();
          }}
          eventClick={handleEventRemove}
          headerToolbar={{
            left: "",
            center: "title",
            right: "resetButton,saveButton,prev,next",
          }}
          customButtons={{
            saveButton: renderSaveButton(),
            resetButton: renderResetButton(),
          }}
          datesSet={(dateInfo) => {
            setCurrentRange({ start: dateInfo.start, end: dateInfo.end });
          }}
          slotDuration="00:30:00"
          allDaySlot={false}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          height="auto"
        />
      </div>
    </div>
  );
}

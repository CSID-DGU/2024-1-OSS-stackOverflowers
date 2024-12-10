import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./ModifySchedule.css";
import "./nav_schedule.css";

export default function ModifySchedule() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]); // 현재 표시되는 이벤트 데이터
  const [scheduleList, setScheduleList] = useState([]); // 로컬스토리지의 모든 근무표 데이터
  const [currentRange, setCurrentRange] = useState({ start: null, end: null }); // 현재 캘린더 범위
  const location = useLocation();
  const initialDate = location.state?.start || new Date();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/worker/events/all');
        if (!response.ok) {
          throw new Error('근무표 조회에 실패했습니다.');
        }
  
        const data = await response.json();
  
        // 시간대별 가장 최신 이벤트를 저장하기 위한 배열
        const uniqueEvents = [];
  
        // 배열을 뒤집어서 최신 이벤트부터 처리
        data.reverse().forEach((event) => {
          const eventStart = new Date(event.start).getTime();
          const eventEnd = new Date(event.end).getTime();
  
          // 현재 이벤트와 겹치는 시간대의 이벤트가 이미 있는지 확인
          const isOverlap = uniqueEvents.some(
            (e) =>
              eventStart < new Date(e.end).getTime() && eventEnd > new Date(e.start).getTime()
          );
  
          // 겹치는 이벤트가 없을 경우에만 추가
          if (!isOverlap) {
            uniqueEvents.push({
              id: event._id,
              title: event.title,
              start: event.start,
              end: event.end,
              backgroundColor: "#52b2d5",
              description: event.description,
              allDay: event.allDay || false,
              extendedProps: {
                workers: event.workers,
              },
            });
          }
        });
  
        setEvents(uniqueEvents);
      } catch (error) {
        console.error('근무표 조회 중 오류 발생:', error);
        alert('근무표를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSchedule();
  }, []);
  
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
    <>
      <div className="schedule-view-container">
        {/* 네비게이션 바 */}
        <header className="navbar">
          <div className="logo_home">ShiftMate</div>
          <nav>
            <ul className="nav-links">
              <li><button className="main-button" onClick={() => { window.location.href = '/admin/main'; }}>홈</button></li>
              <li><button className="main-button" onClick={() => navigate('/admin/events/create')}>근무표 생성</button></li>
              <li><button className="main-button" onClick={() => navigate('/admin/events/all')}>근무표 조회</button></li>
            </ul>
          </nav>
          <div className="auth-buttons">
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
      </header>

      <h1>근무표 수정</h1>

      <div className="modify-calendar-container" style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
      {isLoading ? (
            <div>로딩 중...</div>
          ) : (
        <FullCalendar
          ref={calendarEl}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={koLocale}
          selectable={true}
          editable={true}
          events={events}
          initialDate={initialDate}
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
          height="80%"
        />
          )}
      </div>
    </div>
  </>
  );
}
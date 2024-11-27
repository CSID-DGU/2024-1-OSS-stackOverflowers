import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import './nav_schedule.css';
import { useNavigate } from 'react-router-dom';
//import eventsData from './data/event.json';
import koLocale from '@fullcalendar/core/locales/ko';
import './ModifySchedule.css'

export default function ViewSchedule_admin() {
  const calendarEl = useRef(null);
  const navigate = useNavigate();
  //추가
  const [schedules, setSchedules] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState(null);  //현재 선택된 스케줄
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* useEffect(() => {
    if (calendarEl.current) {
      const calendarApi = calendarEl.current.getApi();
      console.log('Calendar API loaded:', calendarApi);
    }
  }, []); */

  // useEffect를 사용하여 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchSchedules();
  }, []);


  const handlerender = () => {
    if (currentSchedule) {
      navigate(`/admin/events/edit/${currentSchedule._id}`);
    } else {
      alert('수정할 스케줄을 선택해주세요.');
    }
  };

  // 커스텀 버튼 렌더링 함수
  const renderEditButton = () => {
    return {
      text: '수정',
      click: handlerender,
      className: 'fc-button-primary'
    };
  };

  // 전체 스케줄 가져오기
const fetchSchedules = async () => {
  try {
    const response = await fetch('/admin/events/all');
    if (!response.ok) {
      throw new Error('스케줄을 불러오는데 실패했습니다.');
    }
    const data = await response.json();
    
    // 이벤트들을 스케줄 ID별로 그룹화
    const groupedSchedules = data.reduce((acc, event) => {
      if (!acc[event.scheduleId]) {
        acc[event.scheduleId] = {
          id: event.scheduleId,
          workers: event.workers,
          timeUnit: event.timeUnit,
          startHour: event.startHour,
          endHour: event.endHour,
          deadline: event.deadline,
          events: []
        };
      }
      acc[event.scheduleId].events.push({
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description,
        allDay: event.allDay
      });
      return acc;
    }, {});

    // 객체를 배열로 변환
    const schedulesArray = Object.values(groupedSchedules);
    setSchedules(schedulesArray);
    
    // 가장 최근 스케줄을 현재 스케줄로 설정
    if (schedulesArray.length > 0) {
      setCurrentSchedule(schedulesArray[0]);
      if (calendarEl.current) {
        const calendarApi = calendarEl.current.getApi();
        // 첫 번째 이벤트의 시작 날짜로 캘린더 이동
        if (schedulesArray[0].events.length > 0) {
          calendarApi.gotoDate(new Date(schedulesArray[0].events[0].start));
        }
      }
    }
    setLoading(false);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    setError(error.message);
    setLoading(false);
  }
};

const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
  try {
    if (!currentSchedule) {  
      successCallback([]);
      return;
    }
    
    // 현재 선택된 스케줄의 이벤트들을 FullCalendar 형식으로 변환
    const events = currentSchedule.events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      description: event.description,
      allDay: event.allDay,
      backgroundColor: "#52b2d5"
    }));
    
    successCallback(events);
  } catch (error) {
    console.error('Failed to load events:', error);
    failureCallback(error);
  }
};
  
  //추가
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <>
      <div className="schedule-view-container">
        {/* 네비게이션 바 */}
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
            <button onClick={() => navigate('/home')}>로그아웃</button>
          </div>
        </header>
        <h1>근무표 조회</h1>
        {/* 메인 컨텐츠 */}
        <div style={{ height: '80vh', width: '90vw', margin: '0 auto' }}>
          <FullCalendar
            ref={calendarEl}
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            height="80%"
            headerToolbar={{
              left: 'title',
              center: '',
              right: 'editButton,prev,next'  // 기존 버튼들과 함께 저장 버튼 추가
            }}
            customButtons={{
              editButton: renderEditButton()  // 커스텀 버튼 정의
            }}
            locale={koLocale}
            slotDuration="00:30:00"
            events={fetchEvents}
            allDaySlot={false}
          />
        </div>
      </div>
    </>
  );
}
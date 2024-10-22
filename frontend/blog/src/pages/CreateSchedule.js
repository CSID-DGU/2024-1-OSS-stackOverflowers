import React, { useState } from "react";
import "./CreateSchedule.css";

const CreateSchedule = () => {
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("23:00");
  const [timeUnit, setTimeUnit] = useState(1); // 1시간 단위
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());

  const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const allHours = Array.from({ length: 49 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${String(hour).padStart(2, '0')}:${minute}`;
  });

  const handleStartTimeChange = (e) => {
    setStartHour(e.target.value);
    // 종료 시간이 시작 시간보다 이전으로 설정되지 않도록 조정
    if (e.target.value > endHour) {
      setEndHour(e.target.value);
    }
  };

  const handleEndTimeChange = (e) => {
    setEndHour(e.target.value);
  };

  const handleTimeUnitChange = (e) => {
    setTimeUnit(Number(e.target.value));
    
    // 시간 단위가 1시간일 때, 시작 및 종료 시간을 1시간 단위로 설정
    if (Number(e.target.value) === 1) {
      const startHourRounded = Math.floor(parseInt(startHour.split(':')[0]) / 1) * 1;
      const endHourRounded = Math.floor(parseInt(endHour.split(':')[0]) / 1) * 1 + (endHour.endsWith('30') ? 0.5 : 0);
      setStartHour(`${String(startHourRounded).padStart(2, '0')}:00`);
      setEndHour(`${String(endHourRounded).padStart(2, '0')}:00`);
    }
  };

  const handleSave = () => {
    console.log("저장됨:", { startHour, endHour, timeUnit });
  };

  const handleReset = () => {
    setSelectedBlocks(new Set());
  };

  const toggleBlock = (day, hour) => {
    const timeKey = `${day}-${hour}`;
    const newSelectedBlocks = new Set(selectedBlocks);

    if (newSelectedBlocks.has(timeKey)) {
      newSelectedBlocks.delete(timeKey);
    } else {
      newSelectedBlocks.add(timeKey);
    }

    setSelectedBlocks(newSelectedBlocks);
  };

  const visibleHours = [];
  const startIdx = allHours.indexOf(startHour);
  const endIdx = allHours.indexOf(endHour);

  for (let i = startIdx; i < endIdx; i += timeUnit === 1 ? 2 : 1) {
    visibleHours.push(allHours[i]);
  }

  return (
    <div className="schedule-create-container">
      <h1>근무표 작성</h1>
      <p>근무 시작 시간, 종료 시간, 시간 단위를 설정하세요.</p>
      
      <div className="time-setting">
        <label>
          근무 시작 시간:
          <select value={startHour} onChange={handleStartTimeChange}>
            {allHours.filter((hour) => {
              // 1시간 단위일 때는 30분 단위 시간은 제외
              return timeUnit === 1 ? hour.endsWith('00') : true;
            }).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>
        
        <label>
          근무 종료 시간:
          <select value={endHour} onChange={handleEndTimeChange}>
            {allHours.filter((hour) => {
              // 1시간 단위일 때는 30분 단위 시간은 제외
              return timeUnit === 1 ? hour.endsWith('00') : true;
            }).map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </label>

        <label>
          시간 단위:
          <select value={timeUnit} onChange={handleTimeUnitChange}>
            <option value={1}>1시간</option>
            <option value={0.5}>30분</option>
          </select>
        </label>

        <button onClick={handleSave} className="save-button">
          저장
        </button>
        <button onClick={handleReset}>초기화</button>
      </div>

      <div className="schedule-grid">
        <div className="grid-header">
          <div className="time-label"></div>
          {days.map((day, index) => (
            <div key={index} className="day-label">{day}</div>
          ))}
        </div>
        {visibleHours.map((hour, index) => (
          <div key={index} className={`time-row ${timeUnit === 0.5 ? 'half-hour' : ''}`}>
            <div className="time-label">{hour}</div>
            {days.map((day, dayIndex) => (
              <div
                key={`${dayIndex}-${index}`}
                className={`time-block ${selectedBlocks.has(`${day}-${hour}`) ? 'selected' : ''}`}
                style={{ height: timeUnit === 0.5 ? '15px' : '30px' }}
                onMouseDown={() => toggleBlock(day, hour)}
                onMouseEnter={(e) => e.buttons === 1 && toggleBlock(day, hour)}
                onMouseUp={(e) => e.preventDefault()} 
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateSchedule;
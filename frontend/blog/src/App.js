// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/login'; 
import Signup from './pages/signup';
import CreateSchedule from './pages/CreateSchedule';
//import WriteSchedule from './pages/WriteSchedule';
import ViewSchedule from './pages/ViewSchedule';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} /> {/* 메인 홈 화면 */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create" element={<CreateSchedule />} /> {/* 근무표 생성 페이지 */}
        <Route path="/view" element={<ViewSchedule />} /> {/* 바로 ViewSchedule로 이동 */}
        {/* 추가적인 페이지를 여기에 등록할 수 있습니다 */}
      </Routes>
    </Router>
  );
}

export default App;

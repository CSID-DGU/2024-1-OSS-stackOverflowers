// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import CreateSchedule from './pages/CreateSchedule';
import WriteSchedule from './pages/WriteSchedule';
import ViewSchedule_worker from './pages/ViewSchedule_worker';
import ModifySchedule from './pages/ModifySchedule';
import ViewSchedule_admin from './pages/ViewSchedule_admin';
import Home_worker from './pages/Home_worker';
import Home_admin from './pages/Home_admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} /> {/* 메인 홈 화면 */}
        <Route path="/home" element={<Home />} />
        <Route path="/home/login" element={<Login />} />
        <Route path="/home/signup" element={<Signup />} />
        <Route path="/admin/events/create" element={<CreateSchedule />} /> {/* 근무표 생성 페이지 */}
        <Route path="/worker/main" element={<Home_worker />} /> {/* worker main 페이지로 이동 */}
        <Route path="/admin/main" element={<Home_admin />} /> {/* admin main 페이지로 이동 */}
        <Route path="/worker/events/all" element={<ViewSchedule_worker />} /> {/* 바로 ViewSchedule로 이동 */}
        <Route path="/worker/events/apply" element={<WriteSchedule />} /> {/* 바로 ViewSchedule로 이동 */}
        <Route path="/admin/events/all/" element={<ViewSchedule_admin />} /> {/* 바로 ViewSchedule로 이동 */}
        <Route path="/admin/events/edit/" element={<ModifySchedule/>} /> {/* 바로 ViewSchedule로 이동 */}
        {/* 추가적인 페이지를 여기에 등록할 수 있습니다 */}
      </Routes>
    </Router>
  );
}

export default App;

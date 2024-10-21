// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login'; 
import Signup from './pages/signup';
import CreateSchedule from './pages/createSchedule'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/createSchedule" element={<CreateSchedule />} /> {/* 새로운 라우트 */}

        {/* 추가적인 페이지를 여기에 등록할 수 있습니다 */}
      </Routes>
    </Router>
  );
}

export default App;

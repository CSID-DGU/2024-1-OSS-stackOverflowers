import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import './nav_schedule.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo_home">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li><button className="main-button" onClick={() => { window.location.href = '/home'; }}>홈</button></li>
            <li><button className="main-button" onClick={() => navigate('/home/login')}>근무표 생성</button></li>
            <li><button className="main-button" onClick={() => navigate('/home/login')}>근무표 작성</button></li>
            <li><button className="main-button" onClick={() => navigate('/home/login')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
            <button onClick={() => navigate('/home/login')}>로그인</button>
            <button onClick={() => navigate('/home/signup')}>회원가입</button>
        </div>
      </header>

      <div className="main-content">
      <div className="icon-text">
        <span className="icon">📅</span>
        <h1>간편한 근무일정관리</h1>
      </div>
      <p>ShiftMate에서 공정한 스케줄 관리를 통해 함께 성장하세요.</p>
    </div>

      <footer className="footer">
        <p>© 2024 ShiftMate, All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
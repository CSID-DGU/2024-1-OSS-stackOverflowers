import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo">ShiftMate</div>
        <nav>
          <ul className="nav-links">
            <li><button className="main-button" onClick={() => { window.location.href = '/home'; }}>홈</button></li>
            <li><button className="main-button" onClick={() => navigate('/create')}>근무표 생성</button></li>
            <li><button className="main-button" onClick={() => navigate('/write')}>근무표 작성</button></li>
            <li><button className="main-button" onClick={() => navigate('/view')}>근무표 조회</button></li>
          </ul>
        </nav>
        <div className="auth-buttons">
            <button onClick={() => navigate('/login')}>로그인</button>
            <button onClick={() => navigate('/signup')}>회원가입</button>
        </div>
      </header>

      <div className="main-content">
        <h1>꾸준하고픈 개발자의 목표를 성취하는 공간</h1>
        <p>ShiftMate에서 공정한 스케줄 관리를 통해 함께 성장하세요.</p>
      </div>

      <footer className="footer">
        <p>© 2024 ShiftMate, All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
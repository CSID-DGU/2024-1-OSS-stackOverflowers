import React from 'react';
import './login.css';

const Login = () => {
  return (
    <div className="login-container">
      <h1 className="logo">SHIFTMATE</h1>

      <div className="login-form">
        <input
          type="text"
          placeholder="아이디 또는 전화번호"
          className="input-field"
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="input-field"
        />
        <button className="login-button">로그인</button>
      </div>
    </div>
  );
};

export default Login;

// src/SignUp.js
import React, { useState } from 'react';
import './signup.css';

const SignUp = () => {
  const [role, setRole] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div className="signup-container">
      <h1 className="title">회원가입을 위해<br />정보를 입력해주세요</h1>

      <form className="signup-form">
        <label htmlFor="email">* 이메일</label>
        <input type="email" id="email" placeholder="이메일" className="input-field" />

        <label htmlFor="name">* 이름</label>
        <input type="text" id="name" placeholder="이름" className="input-field" />

        <label htmlFor="password">* 비밀번호</label>
        <input type="password" id="password" placeholder="비밀번호" className="input-field" />

        <label htmlFor="phone">* 전화번호</label>
        <input type="text" id="phone" placeholder="전화번호" className="input-field" />

        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="worker"
              checked={role === 'worker'}
              onChange={handleRoleChange}
            />
            근무자
          </label>
          <label>
            <input
              type="radio"
              value="manager"
              checked={role === 'manager'}
              onChange={handleRoleChange}
            />
            관리자
          </label>
        </div>

        <button type="submit" className="submit-button">가입하기</button>
      </form>
    </div>
  );
};

export default SignUp;

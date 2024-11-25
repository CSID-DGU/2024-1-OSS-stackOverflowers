// src/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const SignUp = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({
   id: '',
   name: '',
   password: '',
   phone: ''
 });
 const [role, setRole] = useState('');
 const [error, setError] = useState('');

 const handleChange = (e) => {
   const { id, value } = e.target;
   setFormData(prevState => ({
     ...prevState,
     [id]: value
   }));
 };

 const handleRoleChange = (e) => {
   setRole(e.target.value);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.id || !formData.password || !role) {
    setError('모든 필수 항목을 입력해주세요.');
    return;
  }

  try {
    // role을 userType으로 포함시켜 전송
    const response = await fetch('/home/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        userType: role === 'manager' ? 'admin' : 'worker' // role 값을 서버가 이해할 수 있는 형식으로 변환
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      navigate(data.redirectUrl);
    } else {
      setError(data.message);
      // 에러 응답에도 리다이렉션이 포함된 경우 처리
      if (data.redirectUrl) {
        navigate(data.redirectUrl);
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    setError('서버 오류가 발생했습니다.');
  }
};


 return (
   <div className="signup-container">
     <h1 className="title">회원가입을 위해<br />정보를 입력해주세요</h1>

     {error && <div className="error-message">{error}</div>}

     <form className="signup-form" onSubmit={handleSubmit}>
       <label htmlFor="id">* 아이디</label>
       <input 
         type="text" 
         id="id" 
         placeholder="아이디" 
         className="input-field"
         value={formData.id}
         onChange={handleChange}
         required
       />

       <label htmlFor="name">* 이름</label>
       <input 
         type="text" 
         id="name" 
         placeholder="이름" 
         className="input-field"
         value={formData.name}
         onChange={handleChange}
         required
       />

       <label htmlFor="password">* 비밀번호</label>
       <input 
         type="password" 
         id="password" 
         placeholder="비밀번호" 
         className="input-field"
         value={formData.password}
         onChange={handleChange}
         required
       />
      
       <label htmlFor="phone">* 전화번호</label>
       <input 
         type="text" 
         id="phone" 
         placeholder="전화번호" 
         className="input-field"
         value={formData.phone}
         onChange={handleChange}
         required
       />
      
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

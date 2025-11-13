import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage({ onSignup }) { 
  const [email, setEmail] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { 
      setError('비밀번호가 일치하지 않습니다.'); 
      return; 
    }
    
    // TODO: 실제 회원가입 API 호출
    console.log('회원가입 시도:', { email, universityEmail, password });
    setError('');
    
    // 1. App.jsx의 인증 상태를 업데이트합니다.
    onSignup(); 
    
    // 2. 가입 완료 후 '내 정보' 페이지로 이동합니다.
    navigate('/my-page'); 
  };

  // ★ 일반 버튼에 적용할 스타일 클래스
  const buttonClass = "ml-3 w-auto !py-2.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">회원가입</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">개인 이메일</label>
          <input type="email" id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="example@naver.com" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-uni-email">학교 이메일 (인증용)</label>
          <input type="email" id="signup-uni-email" value={universityEmail} onChange={(e) => setUniversityEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="student@school.ac.kr" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">비밀번호</label>
          <input type="password" id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-confirm-password">비밀번호 확인</label>
          <input type="password" id="signup-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        {error && <p className="text-red-500 text-sm italic mb-2">{error}</p>}
        
        {/* ★ TrendyButton을 일반 button으로 변경 */}
        <button type="submit" className={buttonClass}>
          가입하기
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        이미 계정이 있으신가요?{' '}
        {/* ★ setPage('login') 대신 Link to 사용 */}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
          로그인
        </Link>
      </p>
    </div>
  );
}
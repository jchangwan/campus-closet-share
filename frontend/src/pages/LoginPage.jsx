import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// TrendyButton 임포트 제거

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('student@kyonggi.ac.kr'); // 테스트 편의를 위한 기본값
  const [password, setPassword] = useState('1234'); // 테스트 편의를 위한 기본값
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginSuccess = onLogin(email, password); // 부모의 로그인 함수 호출
    
    if (loginSuccess) {
      setError('');
      navigate('/my-page'); // 성공 시 마이페이지로 이동
    } else {
      setError('학교 이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const buttonClass = "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">로그인</h2>
      <p className="text-center text-gray-600 mb-6">학교 이메일 계정으로 로그인하세요.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-email">학교 이메일</label>
          <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="student@school.ac.kr" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-password">비밀번호</label>
          <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="********" required />
        </div>
        {error && <p className="text-red-500 text-sm italic mb-2">{error}</p>}
        
        {/* ★ TrendyButton을 일반 button으로 변경 */}
        <button type="submit" className={buttonClass}>
          로그인
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-800">
          회원가입
        </Link>
      </p>
    </div>
  );
}
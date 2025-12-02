import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage({ onSignup }) { 
  // 1. 상태 관리
  const [personalEmail, setPersonalEmail] = useState('');
  const [emailLocalPart, setEmailLocalPart] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 인증 관련 상태
  const [authCode, setAuthCode] = useState('');
  const [authStep, setAuthStep] = useState('input');
  const [isVerified, setIsVerified] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const SCHOOL_DOMAIN = '@kyonggi.ac.kr';

  // [기능 1] 인증 메일 발송
  const handleSendVerification = async () => {
    if (!emailLocalPart) {
      setError('학번을 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await axios.post('/auth/email-verification', {
        email: emailLocalPart + SCHOOL_DOMAIN
      });
      alert(`인증 메일이 발송되었습니다!\n${emailLocalPart + SCHOOL_DOMAIN}을 확인해주세요.`);
      setAuthStep('sent'); 
    } catch (err) {
      console.error(err);
      setError('메일 발송 실패. 학번을 확인하거나 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // [기능 2] 인증 번호 확인
  const handleConfirmCode = async () => {
    if (!authCode) {
      setError('인증코드를 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await axios.post('/auth/email-verification/confirm', {
        email: emailLocalPart + SCHOOL_DOMAIN,
        code: authCode
      });
      alert('✅ 학교 인증이 완료되었습니다!');
      setAuthStep('verified');
      setIsVerified(true);
    } catch (err) {
      console.error(err);
      setError('인증 코드가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // [기능 3] 최종 회원가입
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { 
      setError('비밀번호가 일치하지 않습니다.'); 
      return; 
    }
    if (!isVerified) {
      setError('학교 이메일 인증을 먼저 완료해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/auth/signup', {
        emailLocalPart: emailLocalPart,
        password: password,
        personalEmail: personalEmail
      });

      console.log('회원가입 성공');
      onSignup();
      navigate('/my-page');

    } catch (err) {
      console.error(err);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 스타일 정의 (디자인 유지) ---
  const inputClass = "w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500";
  
  // ★ 수정됨: w-auto(자동너비) -> w-full(꽉찬너비)로 변경, ml-3(왼쪽여백) 제거
  const buttonClass = "w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">회원가입</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. 개인 이메일 */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">개인 이메일</label>
          <input 
            type="email" 
            value={personalEmail} 
            onChange={(e) => setPersonalEmail(e.target.value)} 
            className={inputClass} 
            placeholder="example@naver.com" 
            required 
          />
        </div>

        {/* 2. 학교 이메일 인증 */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">학교 이메일 인증</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={emailLocalPart} 
              onChange={(e) => setEmailLocalPart(e.target.value)} 
              className={inputClass} 
              placeholder="학교 이메일을 입력하세요" 
              disabled={authStep === 'verified'} 
            />
            <span className="py-3 text-gray-500 font-bold whitespace-nowrap">@kyonggi.ac.kr</span>
          </div>

          {authStep === 'input' && (
            <button 
              type="button" 
              onClick={handleSendVerification}
              className="mt-2 w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-bold transition-colors"
              disabled={isLoading}
            >
              {isLoading ? '전송 중...' : '인증번호 받기'}
            </button>
          )}

          {authStep === 'sent' && (
            <div className="mt-3 p-3 bg-gray-50 border rounded">
              <input 
                type="text" 
                value={authCode} 
                onChange={(e) => setAuthCode(e.target.value)} 
                className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                placeholder="인증번호 6자리" 
              />
              <button 
                type="button" 
                onClick={handleConfirmCode}
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-bold transition-colors"
              >
                인증 확인
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center cursor-pointer hover:underline" onClick={handleSendVerification}>
                인증번호 재전송
              </p>
            </div>
          )}

          {authStep === 'verified' && (
            <p className="text-green-600 text-sm font-bold mt-2 text-center bg-green-50 py-2 rounded">
              ✅ 인증이 완료되었습니다.
            </p>
          )}
        </div>

        {/* 3. 비밀번호 */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">비밀번호</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className={inputClass} 
            required 
          />
        </div>

        {/* 4. 비밀번호 확인 */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">비밀번호 확인</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className={inputClass} 
            required 
          />
        </div>

        {error && <p className="text-red-500 text-sm italic text-center font-bold">{error}</p>}
        
        {/* ★ 수정된 가입 버튼 (길게!) */}
        <button type="submit" className={buttonClass} disabled={isLoading || !isVerified}>
          {isLoading ? '처리 중...' : '가입하기'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
          로그인
        </Link>
      </p>
    </div>
  );
}
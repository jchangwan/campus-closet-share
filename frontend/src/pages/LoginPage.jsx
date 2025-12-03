import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 회원가입 후 돌아왔을 때 미리 채워줄 이메일 (기존 로직 유지)
  const presetEmail = (location.state && location.state.presetEmail) || '';

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const buttonClass = "w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50";

  useEffect(() => {
    if (presetEmail) setEmail(presetEmail);
  }, [presetEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // App.jsx에서 내려준 handleLogin 함수 호출
      const success = await onLogin(email, password);
      if (!success) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      
      // 로그인 성공 시 피드로 이동
      const redirectTo = (location.state && location.state.from) || '/feed';
      navigate(redirectTo, { replace: true });

    } catch (err) {
      console.error('로그인 중 오류', err);
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          로그인
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              학교 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: student@kyonggi.ac.kr"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}

          <button type="submit" className={buttonClass} disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
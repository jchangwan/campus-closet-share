// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const buttonClass =
    "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const ok = await onLogin(email, password); // 부모(App)의 로그인 함수 호출
      if (ok) {
        navigate("/feed");
      } else {
        setError("학교 이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("login error", err);
      setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        로그인
      </h2>
      <p className="text-center text-gray-600 mb-6">
        학교 이메일 계정으로 로그인하세요.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="login-email"
          >
            학교 이메일
          </label>
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="student@kyonggi.ac.kr"
            required
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="login-password"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="********"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm italic mb-2">{error}</p>
        )}

        <button type="submit" className={buttonClass}>
          로그인
        </button>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        계정이 없으신가요?{" "}
        <Link
          to="/signup"
          className="font-bold text-indigo-600 hover:text-indigo-800"
        >
          회원가입
        </Link>
      </p>
    </div>
  );
}

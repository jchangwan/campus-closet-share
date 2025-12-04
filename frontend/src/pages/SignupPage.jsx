// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthUser } from "../api/client";

export default function SignupPage({ onSignup }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");          // 학교 이메일 (한 칸)
  const [nickname, setNickname] = useState("");    // 닉네임
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isStudentVerified, setIsStudentVerified] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  // 🔹 이메일이 @kyonggi.ac.kr 인지만 확인하는 버튼
  const handleVerifyStudent = () => {
    setEmailError("");
    setIsStudentVerified(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    const atIndex = trimmed.indexOf("@");
    if (atIndex === -1) {
      setEmailError("이메일 형식을 확인해주세요. 예) student@kyonggi.ac.kr");
      return;
    }

    const domain = trimmed.slice(atIndex + 1).toLowerCase();
    if (domain !== "kyonggi.ac.kr") {
      setEmailError("경기대 이메일(@kyonggi.ac.kr)만 가입할 수 있습니다.");
      return;
    }

    // 통과!
    setIsStudentVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isStudentVerified) {
      setError("학생 인증하기 버튼을 눌러 학교 이메일을 먼저 인증해주세요.");
      return;
    }

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (!password || !passwordConfirm) {
      setError("비밀번호와 비밀번호 확인을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await api.post("/auth/signup", {
        email: email.trim(),
        password,
        nickname: nickname.trim(),
      });

      const user = res.data;

      // 전역 axios 헤더 + 로컬스토리지 저장
      setAuthUser(user);
      if (onSignup) {
        onSignup(user);
      }

      navigate("/feed");
    } catch (err) {
      console.error("signup error", err);
      if (err.response?.status === 409) {
        setError("이미 가입된 이메일입니다.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const buttonClass =
    "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        회원가입
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 학교 이메일 한 칸만 사용 */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            학교 이메일
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsStudentVerified(false); // 다시 수정하면 재인증 필요
              }}
              className="flex-1 px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: student@kyonggi.ac.kr"
              required
            />
            <button
              type="button"
              onClick={handleVerifyStudent}
              className="px-3 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 whitespace-nowrap"
            >
              학생 인증하기
            </button>
          </div>
          {isStudentVerified && (
            <p className="text-xs text-green-600 mt-1">
              경기대 이메일 인증이 완료되었습니다.
            </p>
          )}
          {emailError && (
            <p className="text-xs text-red-500 mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="프로필에 보여질 이름"
            required
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
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="********"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="********"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm italic">{error}</p>}

        <button type="submit" className={buttonClass}>
          가입하기
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
          로그인
        </Link>
      </p>
    </div>
  );
}

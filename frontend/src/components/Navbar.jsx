import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const getNavLinkClass = ({ isActive }) => {
  return `ml-6 font-medium ${
    isActive 
      ? 'text-indigo-600 border-b-2 border-indigo-600' 
      : 'text-gray-600 hover:text-indigo-600'
  }`;
};

// ★ currentUser props 받기
export default function Navbar({ isAuthenticated, onLogout, currentUser }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate(isAuthenticated ? '/feed' : '/');
  };

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button 
          onClick={handleLogoClick} 
          className="font-bold text-xl text-indigo-600 cursor-pointer"
        >
          Campus Closet
        </button>
        <div>
          {isAuthenticated ? (
            <>
              {/* ★ currentUser.name 표시 (다시 추가) */}
              <span className="ml-6 font-medium text-gray-800">{currentUser.name || '사용자'}님</span>
              <NavLink to="/feed" className={getNavLinkClass}>피드</NavLink>
              <NavLink to="/social" className={getNavLinkClass}>커뮤니티</NavLink>
              <NavLink to="/my-page" className={getNavLinkClass}>내 정보</NavLink>
              <NavLink to="/messages" className={getNavLinkClass}>쪽지함</NavLink>
              <button onClick={handleLogoutClick} className="ml-6 text-gray-600 hover:text-indigo-600 font-medium">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getNavLinkClass}>로그인</NavLink>
              <NavLink to="/signup" className={getNavLinkClass}>회원가입</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
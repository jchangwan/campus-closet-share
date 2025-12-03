import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from './api/users';
import { login as loginApi } from './api/auth';

// 공통 컴포넌트
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 페이지 컴포넌트
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import MessagePage from './pages/MessagePage';
import ClosetFeedSection from './pages/ClosetFeedSection';
import SocialFeedSection from './pages/SocialFeedSection';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // 임시로 true로 설정. 바꿔야함
  const [currentUser, setCurrentUser] = useState({
    email: '',
    university: '경기대학교',
    profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
    name: '익명 사용자',
    bio: '',
  });

  // --- 로그인 처리 ---
  const handleLogin = async (email, password) => {
    try {
      // 1) 백엔드 로그인 API 호출
      await loginApi({ email, password });

      // 2) 로그인 성공 시 프로필 불러오기
      try {
        const profile = await getMyProfile();
        setCurrentUser((prev) => ({
          ...prev,
          email: profile.email || email,
          name: profile.nickname || prev.name,
          bio: profile.bio || '',
          profileImageUrl: profile.profileImageUrl || prev.profileImageUrl,
        }));
      } catch (e) {
        console.error('프로필 불러오기 실패', e);
        setCurrentUser((prev) => ({
          ...prev,
          email,
        }));
      }

      setIsAuthenticated(true);
      return true;
    } catch (e) {
      console.error('로그인 실패', e);
      return false;
    }
  };

  // --- 로그아웃 처리 ---
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({
      email: '',
      university: '경기대학교',
      profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
      name: '익명 사용자',
      bio: '',
    });
  };

  // --- 프로필 수정 처리 ---
  const handleUpdateProfile = (updatedProfile) => {
    // 1) 프론트 상태 먼저 갱신
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedProfile,
    }));

    // 2) 백엔드에도 PATCH 요청
    (async () => {
      try {
        await updateMyProfile({
          nickname: updatedProfile.name || currentUser.name,
          bio: updatedProfile.bio ?? currentUser.bio,
          profileImageUrl:
            updatedProfile.profileImageUrl || currentUser.profileImageUrl,
        });
      } catch (e) {
        console.error('프로필 업데이트 실패', e);
      }
    })();
  };

  // --- 보호 라우트 ---
  const ProtectedRoute = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  };

  // --- 레이아웃 컴포넌트 ---
  const CenteredLayout = () => (
    <main className="flex-grow flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </main>
  );

  const FullWidthLayout = () => (
    <div className="flex-grow w-full flex">
      <Outlet />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <Routes>
        {/* 공개 페이지들 */}
        <Route element={<CenteredLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/feed" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/feed" replace />
              ) : (
                <SignupPage />
              )
            }
          />
        </Route>

        {/* 로그인 필수 페이지들 */}
        <Route element={<ProtectedRoute />}>
          {/* 피드 / 커뮤니티는 전체 폭 레이아웃 */}
          <Route element={<FullWidthLayout />}>
            <Route path="/feed" element={<ClosetFeedSection />} />
            <Route path="/community" element={<SocialFeedSection />} />
          </Route>

          {/* 마이페이지 / 쪽지함은 센터 레이아웃 */}
          <Route element={<CenteredLayout />}>
            <Route
              path="/mypage"
              element={
                <MyPage
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                />
              }
            />
            <Route path="/messages" element={<MessagePage />} />
          </Route>
        </Route>

        {/* 그 외 경로는 홈/피드로 리다이렉트 */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/feed' : '/'} replace />
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

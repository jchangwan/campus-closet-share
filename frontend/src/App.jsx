import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { mockSocialPosts } from './data/mockData';
import { getMyProfile, updateMyProfile } from './api/users';

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
  const navigate = useNavigate();
  
  // --- 상태 관리 (State) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [currentUser, setCurrentUser] = useState({
    email: 'student@kyonggi.ac.kr',
    university: '경기대학교',
    profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
    name: '클로젯셰어'
  });
  
  // Feed 데이터는 ClosetFeedSection 내부에서 실제 API(/posts)를 호출해 사용합니다.
  // 이 상태는 더 이상 사용하지 않습니다.
  const [closetItems, setClosetItems] = useState([]);

  // 게시글 수정 처리 핸들러 (추가됨)
  const [socialPosts, setSocialPosts] = useState(mockSocialPosts);
  const [initialFeedItem, setInitialFeedItem] = useState(null);

  // --- 핸들러 (Handlers) ---

  const handleLogin = (email, password) => {
if (email === 'student@kyonggi.ac.kr' && password === '1234') { 
  setIsAuthenticated(true);
  // 기본 프로필은 로그인 이메일 기반으로 먼저 설정
  setCurrentUser({
    email: email,
    university: '경기대학교',
    profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
    name: '클로젯셰어'
  });
  // 백엔드 프로필이 있다면 덮어쓰기
  (async () => {
    try {
      const profile = await getMyProfile();
      setCurrentUser(prev => ({
        ...prev,
        email: profile.email || prev.email,
        name: profile.nickname || prev.name,
        bio: profile.bio,
        profileImageUrl: profile.profileImageUrl || prev.profileImageUrl,
      }));
    } catch (e) {
      console.error('Failed to load profile from API', e);
    }
  })();
  return true;
}
    return false;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ email: '', university: '', profileImageUrl: '', name: '' });
  };

const handleUpdateProfile = (updatedProfile) => {
  // 1) Optimistically update local state
  setCurrentUser(prevUser => ({
    ...prevUser,
    ...updatedProfile
  }));
  // 2) 실제 API 호출 (닉네임/한줄소개/프로필 이미지 중심으로 전송)
  const payload = {
    nickname: updatedProfile.name || currentUser.name,
    bio: updatedProfile.bio || currentUser.bio,
    profileImageUrl: updatedProfile.profileImageUrl || currentUser.profileImageUrl,
  };
  (async () => {
    try {
      await updateMyProfile(payload);
    } catch (e) {
      console.error('Failed to update profile via API', e);
    }
  })();
};
// ★★★ [추가됨] 상태 및 반납일 업데이트 핸들러 ★★★

  // ★ [핸들러 추가] 직접 대여 내역 등록하기

  
  const handleToggleSave = (postId) => {
    setSocialPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : item
      )
    );
  };

  // --- (ProtectedRoute - 원본과 동일) ---
  const ProtectedRoute = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  };

  // ★★★ 레이아웃 컴포넌트 (Wrapper) ★★★
  // 1. 중앙 정렬 레이아웃 (MyPage, Messages, Home, Login 등)
  const CenteredLayout = () => (
    <main className="container mx-auto px-4 sm:px-6 py-8 flex-grow">
      <Outlet /> {/* 이 안에 MyPage, LoginPage 등이 렌더링됨 */}
    </main>
  );

  // 2. 꽉 찬 너비 레이아웃 (Feed, Social)
  // 이 레이아웃이 Navbar와 Footer 사이의 공간을 꽉 채웁니다.
  const FullWidthLayout = () => (
    <div className="flex-grow w-full flex">
      <Outlet /> {/* 이 안에 ClosetFeedSection, SocialFeedSection이 렌더링됨 */}
    </div>
  );

  // --- 렌더링 (Render) ---
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} currentUser={currentUser} />
      
      {/* ★★★ 단일 <Routes> 블록으로 수정 ★★★ */}
      <Routes>
        {/* --- Public Routes (중앙 정렬) --- */}
        <Route element={<CenteredLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/feed" /> : <LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/feed" /> : <SignupPage onSignup={() => setIsAuthenticated(true)} />} />
        </Route>
        
        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          {/* 꽉 찬 너비 페이지 */}
          <Route element={<FullWidthLayout />}>
            <Route 
              path="/feed" 
              element={
                            <ClosetFeedSection />
              } 
            />
            <Route 
              path="/social" 
              element={
                                <SocialFeedSection socialPosts={socialPosts} onToggleSave={handleToggleSave} />
              } 
            />
          </Route>
          
          {/* 중앙 정렬 페이지 */}
          <Route element={<CenteredLayout />}>
            <Route 
              path="/my-page" 
              element={
                <MyPage 
                  currentUser={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  allClosetItems={closetItems}
                  allSocialPosts={socialPosts} 
                  onToggleSave={handleToggleSave}
                />
              } 
            />
            <Route path="/messages" element={<MessagePage />} />
          </Route>
        </Route>
        
        {/* --- Fallback Route --- */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/"} />} />
      </Routes>

      <Footer />
    </div>
  );
}
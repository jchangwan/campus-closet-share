import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { allMockClosetItems, mockSocialPosts } from './data/mockData';

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
  
  const [closetItems, setClosetItems] = useState(allMockClosetItems);
  const [socialPosts, setSocialPosts] = useState(mockSocialPosts);
  const [initialFeedItem, setInitialFeedItem] = useState(null);

  // --- 핸들러 (Handlers) ---

  const handleLogin = (email, password) => {
    if (email === 'student@kyonggi.ac.kr' && password === '1234') { 
      setIsAuthenticated(true);
      setCurrentUser({
        email: email,
        university: '경기대학교',
        profileImageUrl: 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile',
        name: '클로젯셰어' 
      });
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ email: '', university: '', profileImageUrl: '', name: '' });
  };

  const handleUpdateProfile = (updatedProfile) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedProfile
    }));
  };

  const handleToggleBookmark = (itemId) => {
    setClosetItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  };
  
  const handleToggleSave = (postId) => {
    setSocialPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : item
      )
    );
  };
  
  const handleViewMyItem = (itemId) => {
    setInitialFeedItem(itemId); 
    navigate('/feed');          
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
                <ClosetFeedSection 
                  closetItems={closetItems}
                  onToggleBookmark={handleToggleBookmark}
                  initialItemId={initialFeedItem}
                  onClearInitialItem={() => setInitialFeedItem(null)}
                />
              } 
            />
            <Route 
              path="/social" 
              element={
                <SocialFeedSection 
                  socialPosts={socialPosts}
                  onToggleSave={handleToggleSave}
                />
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
                  handleViewMyItem={handleViewMyItem} 
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
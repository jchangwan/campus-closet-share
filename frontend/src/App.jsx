// src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";

import { mockSocialPosts } from "./data/mockData";
import { getMyProfile, updateMyProfile } from "./api/users";
import api, { restoreAuthUser, setAuthUser } from "./api/client";

// 공통 컴포넌트
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 페이지 컴포넌트
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyPage from "./pages/MyPage";
import MessagePage from "./pages/MessagePage";
import ClosetFeedSection from "./pages/ClosetFeedSection";
import SocialFeedSection from "./pages/SocialFeedSection";

export default function App() {
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    id: null,
    email: "",
    university: "경기대학교",
    profileImageUrl:
      "https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile",
    name: "클로젯셰어",
    bio: "",
  });

  // ClosetFeedSection에서 실제로는 API(/posts)를 쓰지만
  // 마이페이지 등에서 목록을 모을 때를 대비해서 유지
  const [closetItems, setClosetItems] = useState([]);

  const [socialPosts, setSocialPosts] = useState(mockSocialPosts);

  // --- 앱 처음 로드될 때: 로그인 상태 복원 ---
  useEffect(() => {
    const saved = restoreAuthUser();
    if (saved) {
      setIsAuthenticated(true);
      setCurrentUser((prev) => ({
        ...prev,
        id: saved.id ?? prev.id,
        email: saved.email || prev.email,
        name: saved.nickname || prev.name,
        profileImageUrl: saved.profileImageUrl || prev.profileImageUrl,
      }));

      // 프로필 API에서 bio, 프로필 이미지 등을 덮어쓰기
      (async () => {
        try {
          const profile = await getMyProfile();
          setCurrentUser((prev) => ({
            ...prev,
            email: profile.email || prev.email,
            name: profile.nickname || prev.name,
            bio: profile.bio ?? prev.bio,
            profileImageUrl: profile.profileImageUrl || prev.profileImageUrl,
          }));
        } catch (e) {
          console.error("Failed to load profile on app init", e);
        }
      })();
    }
  }, []);

  // --- 핸들러들 ---

  // 실제 로그인 처리 (백엔드 /auth/login 호출)
  const handleLogin = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const user = res.data; // AuthController.UserResponse

      // axios 전역 헤더 + localStorage 저장
      setAuthUser(user);

      // 상태 갱신
      setIsAuthenticated(true);
      setCurrentUser((prev) => ({
        ...prev,
        id: user.id ?? prev.id,
        email: user.email || prev.email,
        name: user.nickname || prev.name,
        profileImageUrl: user.profileImageUrl || prev.profileImageUrl,
      }));

      // 로그인 후 프로필 API로 부가 정보 로드
      try {
        const profile = await getMyProfile();
        setCurrentUser((prev) => ({
          ...prev,
          email: profile.email || prev.email,
          name: profile.nickname || prev.name,
          bio: profile.bio ?? prev.bio,
          profileImageUrl: profile.profileImageUrl || prev.profileImageUrl,
        }));
      } catch (e) {
        console.error("Failed to load profile after login", e);
      }

      return true;
    } catch (err) {
      console.error("login failed", err);
      return false;
    }
  };

  // 회원가입 성공 후 호출 (SignupPage에서 onSignup(user)로 전달)
  const handleAfterSignup = (user) => {
    // axios 헤더/로컬스토리지는 SignupPage에서 이미 setAuthUser 호출함
    setIsAuthenticated(true);
    setCurrentUser((prev) => ({
      ...prev,
      id: user.id ?? prev.id,
      email: user.email || prev.email,
      name: user.nickname || prev.name,
      profileImageUrl: user.profileImageUrl || prev.profileImageUrl,
    }));

    navigate("/feed");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({
      id: null,
      email: "",
      university: "경기대학교",
      profileImageUrl: "",
      name: "",
      bio: "",
    });
    setAuthUser(null); // X-USER-ID 헤더 제거 + localStorage 비우기
    navigate("/");
  };

  // 프로필 수정
  const handleUpdateProfile = (updatedProfile) => {
    // 1) 먼저 로컬 상태를 낙관적으로 갱신
    setCurrentUser((prevUser) => ({
      ...prevUser,
      ...updatedProfile,
      name: updatedProfile.name ?? prevUser.name,
    }));

    // 2) 실제 API 호출 (닉네임, 한줄소개, 프로필 이미지)
    const payload = {
      nickname: updatedProfile.name || currentUser.name,
      bio: updatedProfile.bio ?? currentUser.bio,
      profileImageUrl:
        updatedProfile.profileImageUrl || currentUser.profileImageUrl,
    };

    (async () => {
      try {
        await updateMyProfile(payload);
      } catch (e) {
        console.error("Failed to update profile via API", e);
      }
    })();
  };

  // 커뮤니티 게시글 저장/북마크 토글 (로컬 상태 기준)
  const handleToggleSave = (postId) => {
    setSocialPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  };

  // --- 라우트 보호 컴포넌트 ---
  const ProtectedRoute = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  };

  // --- 레이아웃 컴포넌트들 ---

  // 중앙 정렬 레이아웃 (Home, Login, Signup, MyPage, Message 등)
  const CenteredLayout = () => (
    <main className="container mx-auto px-4 sm:px-6 py-8 flex-grow">
      <Outlet />
    </main>
  );

  // 꽉 찬 너비 레이아웃 (피드, 커뮤니티)
  const FullWidthLayout = () => (
    <div className="flex-grow w-full flex">
      <Outlet />
    </div>
  );

  // --- 렌더링 ---
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <Routes>
        {/* --- Public Routes (중앙 정렬) --- */}
        <Route element={<CenteredLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/feed" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/feed" />
              ) : (
                <SignupPage onSignup={handleAfterSignup} />
              )
            }
          />
        </Route>

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          {/* 꽉 찬 너비 레이아웃: 피드 / 커뮤니티 */}
          <Route element={<FullWidthLayout />}>
            <Route path="/feed"
            element={
                <ClosetFeedSection
                currentUser={currentUser}
                 />
                 }
             />
            <Route
              path="/social"
              element={
                <SocialFeedSection
                  socialPosts={socialPosts}
                  onToggleSave={handleToggleSave}
                  currentUser={currentUser}
                />
              }
            />
          </Route>

          {/* 중앙 정렬 레이아웃: 마이페이지 / 쪽지 */}
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
            <Route path="/messages" element={<MessagePage currentUser={currentUser} />} />
          </Route>
        </Route>

        {/* --- Fallback Route --- */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/feed" : "/"} />}
        />
      </Routes>

      <Footer />
    </div>
  );
}

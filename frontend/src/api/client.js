// src/api/client.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 공통 axios 인스턴스
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// 로컬스토리지 키
const AUTH_KEY = "authUser";

/**
 * 현재 로그인한 유저 정보를 저장하고
 * 모든 요청에 X-USER-ID 헤더를 자동으로 붙인다.
 */
export function setAuthUser(user) {
  if (user && user.id) {
    api.defaults.headers.common["X-USER-ID"] = String(user.id);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    delete api.defaults.headers.common["X-USER-ID"];
    localStorage.removeItem(AUTH_KEY);
  }
}

/**
 * 새로고침 후에도 로그인 유지하기 위해
 * 로컬스토리지에서 유저 정보를 복원하고 헤더를 세팅한다.
 */
export function restoreAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.id) {
      api.defaults.headers.common["X-USER-ID"] = String(user.id);
      return user;
    }
  } catch (e) {
    console.error("failed to restore auth user", e);
  }
  return null;
}

export default api;

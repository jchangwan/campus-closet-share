import api from './client';

// 1. 이메일 인증번호 발송 (친구분 코드 로직 반영)
// POST /auth/email-verification
export async function sendVerificationEmail(email) {
  const res = await api.post('/auth/email-verification', { email });
  return res.data;
}

// 2. 이메일 인증번호 확인
// POST /auth/email-verification/confirm
export async function confirmVerificationCode(email, code) {
  const res = await api.post('/auth/email-verification/confirm', { email, code });
  return res.data;
}

// 3. 회원가입 (스펙 2-2-1 준수: nickname, university 포함)
// POST /auth/signup
export async function signup(data) {
  // data: { email, password, nickname, university }
  const res = await api.post('/auth/signup', data);
  return res.data;
}

// 4. 로그인
export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}
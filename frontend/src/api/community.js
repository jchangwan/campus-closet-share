// src/api/community.js
import api from './client';

// 1) 커뮤니티 글 목록 조회
// GET /community/posts?page=0&size=20&sort=latest|popular
export async function listCommunityPosts(params = {}) {
  const { page = 0, size = 20, sort = 'latest' } = params;
  const res = await api.get('/community/posts', {
    params: { page, size, sort },
  });
  // 스펙 상 응답이 그냥 배열([]) 형태이므로 그대로 반환
  return res.data; // [ { id, authorId, ... }, ... ]
}

// 2) 커뮤니티 글 상세 조회
// GET /community/posts/{postId}
export async function getCommunityPost(postId) {
  const res = await api.get(`/community/posts/${postId}`);
  return res.data; // { id, title, content, imageUrls, comments: [...] }
}

// 3) 커뮤니티 글 작성
// POST /community/posts
// body: { title, content, imageUrls: [] }
export async function createCommunityPost(payload) {
  const res = await api.post('/community/posts', payload);
  return res.data;
}

// 4) 커뮤니티 글 수정
// PATCH /community/posts/{postId}
export async function updateCommunityPost(postId, payload) {
  const res = await api.patch(`/community/posts/${postId}`, payload);
  return res.data;
}

// 5) 커뮤니티 글 삭제
// DELETE /community/posts/{postId}
export async function deleteCommunityPost(postId) {
  const res = await api.delete(`/community/posts/${postId}`);
  // 204라 body 없을 수도 있으니 그냥 true만 리턴
  return true;
}

// 6) 좋아요 토글
// POST /community/posts/{postId}/like
export async function toggleCommunityLike(postId) {
  const res = await api.post(`/community/posts/${postId}/like`);
  // { postId, likeCount, liked }
  return res.data;
}

// 7) 댓글 목록
// GET /community/posts/{postId}/comments
export async function listCommunityComments(postId) {
  const res = await api.get(`/community/posts/${postId}/comments`);
  return res.data; // [ { id, authorId, authorNickname, content, createdAt }, ... ]
}

// 8) 댓글 작성
// POST /community/posts/{postId}/comments
export async function createCommunityComment(postId, content) {
  const res = await api.post(`/community/posts/${postId}/comments`, { content });
  return res.data;
}

// 9) 댓글 삭제
// DELETE /community/comments/{commentId}
export async function deleteCommunityComment(commentId) {
  await api.delete(`/community/comments/${commentId}`);
  return true;
}

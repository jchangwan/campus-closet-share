// src/api/posts.js
import api from "./client";

// 필요하면 필터 파라미터 확장
function buildParams(params = {}) {
  return params;
}

// 1) 게시글 목록 조회 (옷장 피드 목록)
export async function listPosts(params = {}) {
  const res = await api.get("/posts", { params: buildParams(params) });
  return res.data; // 현재 PostController는 List<Post> 형태 반환
}

// 2) 게시글 상세 조회
export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data; // DetailResponse
}

// 3) 옷 등록(게시글 생성) - JSON으로 전송
// payload: { title, content, imageUrl }
export async function createPost(payload) {
  const res = await api.post("/posts", payload);
  return res.data; // DetailResponse
}

// 4) 게시글 수정
// payload: { title?, content?, imageUrl?, rentalStatus? ... }
export async function updatePost(id, payload) {
  const res = await api.put(`/posts/${id}`, payload);
  return res.data;
}

// 5) 게시글 삭제
export async function deletePost(id) {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
}

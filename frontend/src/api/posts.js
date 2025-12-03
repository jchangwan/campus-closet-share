import api from './client';

// 파라미터 빌더
function buildParams(params = {}) {
  const query = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query[key] = params[key];
    }
  });
  return query;
}

// 1. 게시글 목록 조회
// GET /posts?category=TOP&size=M...
export async function listPosts(params = {}) {
  const res = await api.get('/posts', { params: buildParams(params) });
  // 스펙상 응답: [{ id, title, description, imageUrl, ... }] (배열)
  return res.data; 
}

// 2. 게시글 상세 조회
// GET /posts/{id}
export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

// 3. 게시글 작성 (스펙 2-3-3)
// Body: { title, description, imageUrl, category, size }
export async function createPost(payload) {
  const res = await api.post('/posts', payload);
  return res.data;
}

// 4. 게시글 수정
export async function updatePost(id, payload) {
  const res = await api.patch(`/posts/${id}`, payload);
  return res.data;
}

// 5. 게시글 삭제
export async function deletePost(id) {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
}
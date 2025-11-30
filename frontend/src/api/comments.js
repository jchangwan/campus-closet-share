import api from './client';

export async function createComment(postId, content) {
  const res = await api.post(`/posts/${postId}/comments`, { content });
  return res.data;
}
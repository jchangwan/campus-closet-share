import api from './client';

function buildParams(params = {}) {
  return params;
}

export async function listPosts(params = {}) {
  const res = await api.get('/posts', { params: buildParams(params) });
  return res.data;
}

export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

export async function createPostWithImages(data, images = []) {
  const form = new FormData();
  form.append('data', JSON.stringify(data));
  if (images && images.length) {
    Array.from(images).forEach(file => form.append('images', file));
  }
  const res = await api.post('/posts', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updatePost(id, payload) {
  const res = await api.patch(`/posts/${id}`, payload);
  return res.data;
}

export async function deletePost(id) {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
}
import api from './client';

export async function getMyProfile() {
  const res = await api.get('/users/me');
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateMyProfile(payload) {
  const res = await api.patch('/users/me', payload);
  return res.data;
}
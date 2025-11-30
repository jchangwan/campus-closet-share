import api from './client';

export async function sendMessage(payload) {
  const res = await api.post('/messages', payload);
  return res.data;
}

export async function getInbox(params = {}) {
  const res = await api.get('/messages/inbox', { params });
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get('/messages/unread-count');
  return res.data;
}

export async function getMessage(id) {
  const res = await api.get(`/messages/${id}`);
  return res.data;
}
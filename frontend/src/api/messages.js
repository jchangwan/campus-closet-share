import api from './client';


export async function sendMessage({ receiverId, postId, content }) {
  const res = await api.post('/messages', {
    receiverId, // ★ 반드시 포함되어야 함
    postId,
    content,
  });
  return res.data;
}


export async function getInbox(params = {}) {
  const res = await api.get('/messages/inbox', { params });
  const data = res.data;

  // data가 이미 배열이면 그대로 리턴
  if (Array.isArray(data)) {
    return data;
  }

  // Page<Message> 형태일 때 (Spring JPA 많이 쓰는 형태)
  if (Array.isArray(data.content)) {
    return data.content;
  }

  // { messages: [...] } 형태일 때
  if (Array.isArray(data.messages)) {
    return data.messages;
  }

  // 그래도 아니면 빈 배열
  return [];
}


export async function getUnreadCount() {
  const res = await api.get('/messages/unread-count');
  return res.data;
}

export async function getMessage(id) {
  const res = await api.get(`/messages/${id}`);
  return res.data;
}

export async function getConversation({ postId, otherUserId }) {
  const res = await api.get('/messages/conversation', {
    params: { postId, otherUserId },
  });
  return res.data; // [ { id, senderId, receiverId, postId, content, createdAt, ...}, ... ]
}
export async function listReceivedMessages() {
  const res = await api.get('/messages');
  return res.data;
}

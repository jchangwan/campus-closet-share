import api from './client';

// 1. 채팅방 목록 조회 (GET /messages/rooms)
export async function getChatRooms() {
  const res = await api.get('/messages/rooms');
  return res.data; // [{ roomId, otherUserId, otherNickname, lastMessage, updatedAt }, ...]
}

// 2. 특정 채팅방 메시지 목록 (GET /messages?roomId=1)
export async function getMessagesInRoom(roomId) {
  const res = await api.get('/messages', { params: { roomId } });
  return res.data; // [{ id, roomId, senderId, content, createdAt }, ...]
}

// 3. 메시지 보내기 (POST /messages)
// payload: { roomId, receiverId, content }
export async function sendMessage(payload) {
  const res = await api.post('/messages', payload);
  return res.data;
}

// 4. (필요 시 유지) 읽지 않은 개수
export async function getUnreadCount() {
  const res = await api.get('/messages/unread-count');
  return res.data;
}
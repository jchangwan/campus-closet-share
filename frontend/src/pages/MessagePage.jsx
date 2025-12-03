import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getChatRooms, getMessagesInRoom, sendMessage } from '../api/messages';

export default function MessagePage() { 
  const location = useLocation();
  const [chatRooms, setChatRooms] = useState([]); // (구 messages) -> 채팅방 목록
  const [selectedRoomId, setSelectedRoomId] = useState(null); // (구 selectedMessage)
  const [roomMessages, setRoomMessages] = useState([]); // 채팅방 내부 대화 목록
  const [replyText, setReplyText] = useState('');
  
  // 피드에서 넘어온 경우 (새 채팅 타겟)
  const [newChatTarget, setNewChatTarget] = useState(null);

  // 1. 초기 로드: 채팅방 목록
  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getChatRooms();
        setChatRooms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('failed to load chat rooms', e);
      }
    }
    loadRooms();
  }, []);

  // 2. 피드에서 넘어왔을 때 처리
  useEffect(() => {
    if (location.state?.targetInfo) {
      const { receiverId, itemTitle } = location.state.targetInfo;
      // 이미 방이 있는지 확인 (상대방 ID로)
      const existingRoom = chatRooms.find(r => r.otherUserId === receiverId);
      if (existingRoom) {
        setSelectedRoomId(existingRoom.roomId);
      } else {
        setNewChatTarget({ receiverId, itemTitle });
        setSelectedRoomId(null);
      }
    }
  }, [location.state, chatRooms]);

  // 3. 방 선택 시 메시지 로드
  useEffect(() => {
    if (selectedRoomId) {
      setNewChatTarget(null);
      async function loadMessages() {
        try {
          const data = await getMessagesInRoom(selectedRoomId);
          setRoomMessages(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error('failed to load messages', e);
        }
      }
      loadMessages();
    }
  }, [selectedRoomId]);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setReplyText('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    let roomIdToSend = selectedRoomId;
    let receiverIdToSend = null;

    // A. 기존 방에서 보내기
    if (selectedRoomId) {
      const room = chatRooms.find(r => r.roomId === selectedRoomId);
      if (room) receiverIdToSend = room.otherUserId;
    } 
    // B. 새 채팅 보내기
    else if (newChatTarget) {
      receiverIdToSend = newChatTarget.receiverId;
    }

    if (!receiverIdToSend) return;

    try {
      await sendMessage({
        roomId: roomIdToSend,
        receiverId: receiverIdToSend,
        content: replyText.trim(),
      });
      setReplyText('');
      
      // 전송 후 처리
      if (roomIdToSend) {
        // 기존 방이면 메시지 목록 갱신
        const data = await getMessagesInRoom(roomIdToSend);
        setRoomMessages(Array.isArray(data) ? data : []);
      } else {
        // 새 방이면 페이지 새로고침(혹은 방 목록 갱신)
        alert('메시지를 보냈습니다. 목록에서 확인해주세요.');
        window.location.reload(); 
      }
    } catch (e) {
      console.error('failed to send message', e);
      alert('쪽지 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg flex h-[600px] overflow-hidden mt-8">
      {/* 왼쪽: 채팅방 리스트 (원래 디자인 유지) */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">채팅 목록</h2>
          <span className="text-xs text-gray-500">{chatRooms.length}개</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              진행 중인 대화가 없습니다.
            </div>
          ) : (
            chatRooms.map(room => (
              <button
                key={room.roomId}
                onClick={() => handleSelectRoom(room.roomId)}
                className={
                  "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 flex flex-col " +
                  (selectedRoomId === room.roomId ? "bg-indigo-50" : "")
                }
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {room.otherNickname || `User ${room.otherUserId}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {room.updatedAt?.substring(0, 10)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate">{room.lastMessage}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 오른쪽: 선택된 방 대화 내용 (원래 레이아웃 유지, 내용은 채팅 스타일로) */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId || newChatTarget ? (
          <>
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">
                {newChatTarget ? `새 대화 (상품: ${newChatTarget.itemTitle})` : `대화방 #${selectedRoomId}`}
              </h2>
            </div>
            
            {/* 대화 내용 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {newChatTarget && (
                <div className="text-center text-gray-400 text-sm my-4">
                  메시지를 보내 대화를 시작하세요.
                </div>
              )}
              {roomMessages.map((msg, idx) => {
                 // 내 메시지인지 구분 (임시: 실제론 myUserId 비교 필요)
                 const isMe = false; 
                 return (
                   <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                       isMe ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                     }`}>
                       <div className="font-bold text-xs mb-1 opacity-70">
                         {isMe ? '나' : `User ${msg.senderId}`}
                       </div>
                       {msg.content}
                     </div>
                   </div>
                 );
              })}
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSubmitReply} className="border-t border-gray-200 px-4 py-3 flex space-x-2 bg-white">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="메시지를 입력하세요..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                전송
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            왼쪽에서 채팅방을 선택하면 대화 내용을 볼 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
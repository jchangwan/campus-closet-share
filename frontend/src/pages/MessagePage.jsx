import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mockChatRooms } from '../data/mockData'; // 데이터 임포트

export default function MessagePage() { 
  const [currentChatRooms, setCurrentChatRooms] = useState(mockChatRooms); 
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const bottomOfMessagesRef = useRef(null); 
  
  // 1. props 대신 react-router-dom의 useLocation 훅을 사용합니다.
  // 다른 페이지에서 navigate('/messages', { state: { targetInfo: {...} } })로
  // 데이터를 전달하면, 여기서 받을 수 있습니다.
  const location = useLocation();
  const messageTarget = location.state?.targetInfo;

  // 2. messageTarget (location.state)을 기반으로 특정 채팅방을 열어주는 로직
  useEffect(() => {
    let chatRoomToSelect = null; 
    let autoMessage = ''; 
    let isNewRoom = false;
    
    // location.state로 전달받은 targetInfo가 있는지 확인합니다.
    if (messageTarget && messageTarget.itemId) {
      // 1. 기존에 대화방이 있는지 찾습니다.
      chatRoomToSelect = currentChatRooms.find(room => room.itemId === messageTarget.itemId);
      
      // 2. 대화방이 없다면 새로 만듭니다.
      if (!chatRoomToSelect) {
        isNewRoom = true;
        const newChatRoom = { 
          id: `chat_${Date.now()}`, 
          itemId: messageTarget.itemId, 
          itemTitle: messageTarget.itemTitle, 
          itemImageUrl: messageTarget.itemImageUrl.replace('600x600', '100x100'), 
          withUser: messageTarget.authorName, 
          messages: [], 
        };
        const updatedChatRooms = [newChatRoom, ...currentChatRooms]; 
        setCurrentChatRooms(updatedChatRooms); 
        chatRoomToSelect = newChatRoom; 
        
        // 3. 새 대화방일 경우, 자동으로 메시지 내용을 채워줍니다.
        autoMessage = `안녕하세요! '${messageTarget.itemTitle}' 글 보고 대여 문의드립니다.`;
      }
    }

    // 4. 대상 채팅방을 선택합니다.
    if (chatRoomToSelect) {
      // 기존 채팅방을 맨 위로 올립니다.
      if (!isNewRoom) { 
        setCurrentChatRooms(prevRooms => { 
          const otherRooms = prevRooms.filter(r => r.id !== chatRoomToSelect.id); 
          return [chatRoomToSelect, ...otherRooms]; 
        }); 
      }
      setSelectedChatRoomId(chatRoomToSelect.id);
      if (autoMessage) { 
        setNewMessage(autoMessage); 
      }
    } else if (currentChatRooms.length > 0) {
      // 5. 특정 타겟이 없으면, 그냥 목록의 첫 번째 채팅방을 선택합니다.
      setSelectedChatRoomId(currentChatRooms[0].id); 
    }
  }, [messageTarget]); // 페이지 이동 시 (location.state 변경 시) 1회 실행

  // 6. 채팅 스크롤을 맨 아래로 내리는 로직 (원본과 동일)
  useEffect(() => { 
    if (bottomOfMessagesRef.current) { 
      bottomOfMessagesRef.current.scrollIntoView({ behavior: "smooth" }); 
    } 
  }, [currentChatRooms, selectedChatRoomId]);

  // 7. 현재 선택된 채팅방 정보
  const selectedChatRoom = currentChatRooms.find(room => room.id === selectedChatRoomId);

  // 8. 메시지 전송 핸들러 (원본과 동일)
  const handleSendMessage = (e) => {
    e.preventDefault(); 
    if (!newMessage.trim() || !selectedChatRoom) return; 
    
    const messageToAdd = { sender: 'me', text: newMessage }; 
    let roomToMove = null;

    // 현재 채팅방에 새 메시지를 추가하고,
    // 그 채팅방을 목록 맨 위로 올립니다.
    const updatedChatRooms = currentChatRooms.map(room => { 
      if (room.id === selectedChatRoomId) { 
        roomToMove = { ...room, messages: [...room.messages, messageToAdd] }; 
        return roomToMove; 
      } 
      return room; 
    }).filter(room => room.id !== selectedChatRoomId); 
    
    setCurrentChatRooms([roomToMove, ...updatedChatRooms]); 
    setNewMessage(''); 
  };

  // 9. ★ 일반 버튼에 적용할 스타일 클래스
  const buttonClass = "ml-3 w-auto !py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all duration-300";

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-5xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
      
      {/* ------------------------- */}
      {/* 1. 쪽지방 목록 (왼쪽) */}
      {/* ------------------------- */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">쪽지함</h2>
        </div>
        <div>
          {currentChatRooms.length === 0 && (
            <p className="text-gray-500 text-sm text-center p-4">대화 내역이 없습니다.</p>
          )}
          {currentChatRooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => setSelectedChatRoomId(room.id)} 
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedChatRoomId === room.id ? 'bg-indigo-50' : ''}`}
            >
              <img src={room.itemImageUrl} alt={room.itemTitle} className="w-12 h-12 rounded-lg object-cover mr-3" />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-gray-800 text-sm truncate">{room.itemTitle}</p>
                <p className="text-xs text-gray-500">{room.withUser}</p>
                <p className="text-sm text-gray-600 truncate">
                  {room.messages.length > 0 
                    ? room.messages[room.messages.length - 1].text 
                    : '대화를 시작하세요...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------- */}
      {/* 2. 현재 채팅창 (오른쪽) */}
      {/* ------------------------- */}
      <div className="w-2/3 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* 2-1. 헤더 */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 truncate">{selectedChatRoom.itemTitle}</h3>
              <p className="text-sm text-gray-600">상대방: {selectedChatRoom.withUser}</p>
            </div>
            
            {/* 2-2. 메시지 목록 */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedChatRoom.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${ 
                    msg.sender === 'me' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none' 
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* 스크롤을 위한 빈 div */}
              <div ref={bottomOfMessagesRef} /> 
            </div>
            
            {/* 2-3. 메시지 입력창 */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                className="flex-1 px-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="메시지를 입력하세요..." 
              />
              {/* ★ TrendyButton을 일반 button으로 변경 */}
              <button type="submit" className={buttonClass}>
                전송
              </button>
            </form>
          </>
        ) : (
          // 3. 선택된 채팅방이 없을 때
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {currentChatRooms.length > 0 
              ? '쪽지 목록에서 대화를 선택하세요.' 
              : '아직 대화 내역이 없습니다.'}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getInbox, sendMessage } from '../api/messages';

export default function MessagePage() { 
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [paging, setPaging] = useState({ page: 0, size: 20, last: false });

  useEffect(() => {
    async function loadInbox() {
      try {
        const data = await getInbox({ page: 0, size: 20, sort: 'createdAt,desc' });
        setMessages(data.content || []);
        setPaging({ page: data.page, size: data.size, last: data.last });
      } catch (e) {
        console.error('failed to load inbox', e);
      }
    }
    loadInbox();
  }, []);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText('');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    try {
      await sendMessage({
        receiverId: selectedMessage.senderId,
        postId: selectedMessage.postId,
        content: replyText.trim(),
      });
      alert('쪽지를 보냈습니다.');
      setReplyText('');
    } catch (e) {
      console.error('failed to send message', e);
      alert('쪽지 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg flex h-[600px] overflow-hidden">
      {/* 왼쪽: 받은 쪽지 리스트 */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">받은 쪽지함</h2>
          <span className="text-xs text-gray-500">{messages.length}개</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              아직 받은 쪽지가 없습니다.
            </div>
          ) : (
            messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={
                  "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-indigo-50 flex flex-col " +
                  (selectedMessage && selectedMessage.id === msg.id ? "bg-indigo-50" : "")
                }
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-gray-800">보낸이 ID: {msg.senderId}</span>
                  {!msg.isRead && <span className="text-xs text-indigo-600 font-bold">NEW</span>}
                </div>
                <p className="text-xs text-gray-500 mb-1">관련 게시글 ID: {msg.postId}</p>
                <p className="text-sm text-gray-700 truncate">{msg.content}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 오른쪽: 선택된 쪽지 + 답장 */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">쪽지 내용</h2>
              <p className="text-xs text-gray-500 mt-1">
                보낸이 ID: {selectedMessage.senderId} · 게시글 ID: {selectedMessage.postId}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="bg-gray-50 rounded-lg p-3 text-gray-800 text-sm">
                {selectedMessage.content}
              </div>
            </div>
            <form onSubmit={handleSubmitReply} className="border-t border-gray-200 px-4 py-3 flex space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="답장을 입력하세요..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                보내기
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            왼쪽에서 쪽지를 선택하면 내용을 볼 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
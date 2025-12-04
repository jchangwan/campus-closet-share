// src/pages/MessagePage.jsx
import React, { useEffect, useState } from "react";
import { getInbox, sendMessage, getConversation } from "../api/messages";

export default function MessagePage({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [replyText, setReplyText] = useState("");

  // 받은 쪽지함 불러오기
  useEffect(() => {
    (async () => {
      try {
        const data = await getInbox();
        setMessages(data || []);
      } catch (e) {
        console.error("failed to load inbox", e);
      }
    })();
  }, []);

  // 🔥 대화 전체 불러오는 함수 (postId + 나 + 상대)
  const loadConversation = async (postId, userId, otherUserId) => {
    try {
      const conv = await getConversation({ postId, userId, otherUserId });
      setConversation(conv || []);
    } catch (e) {
      console.error("failed to load conversation", e);
      setConversation([]);
    }
  };

  // 🔥 상대 id 계산 (otherUserId가 없을 수도 있으니까)
  const getOtherUserId = (msg) => {
    if (msg.otherUserId) return msg.otherUserId;
    // 받은 쪽지함이면 sender가 항상 상대
    if (currentUser && msg.senderId && msg.receiverId) {
      return msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
    }
    return msg.senderId; // 최소한 이건 있음
  };

  // 좌측 쪽지 클릭했을 때
  const handleSelectMessage = (msg) => {
    const otherUserId = getOtherUserId(msg);

    // otherUserId를 강제로 심어서 저장
    const normalized = { ...msg, otherUserId };
    setSelectedMessage(normalized);

    if (!currentUser?.id) return;

    loadConversation(msg.postId, currentUser.id, otherUserId);
  };

  // 🔥 답장 보내기
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;
    if (!currentUser?.id) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const otherUserId = getOtherUserId(selectedMessage);

    try {
      // 1) 쪽지 전송
      await sendMessage({
        receiverId: otherUserId,
        postId: selectedMessage.postId,
        content: replyText.trim(),
      });

      // 2) 방금 쓴 내용까지 포함해서 대화 다시 불러오기
      await loadConversation(
        selectedMessage.postId,
        currentUser.id,
        otherUserId
      );

      setReplyText("");
    } catch (e) {
      console.error("failed to send message", e);
      if (e.response) {
        console.error("status:", e.response.status, "data:", e.response.data);
      }
      alert("쪽지 전송 중 오류가 발생했습니다.");
    }
  };
  // === (postId, otherUserId) 별로 한 줄만 보이게 묶기 ===
  const threads = (() => {
    const map = new Map();

    for (const msg of messages) {
      const otherId = getOtherUserId(msg);
      const key = `${msg.postId}-${otherId}`;

      const existing = map.get(key);

      // createdAt 기준으로 더 최신인 메시지를 남김
      if (
        !existing ||
        new Date(msg.createdAt) > new Date(existing.createdAt)
      ) {
        map.set(key, { ...msg, otherUserId: otherId });
      }
    }

    // 최신순으로 정렬 (원하면 빼도 됨)
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  })();

  // === 아래는 렌더링 부분 (좌측 목록 + 우측 대화) ===

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl p-6 flex space-x-6">
            {/* 왼쪽: 받은 쪽지함 */}
            <div className="w-1/3 border-r pr-4">
              <h2 className="text-xl font-bold mb-4">받은 쪽지함</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {threads.map((msg) => (   // ⬅ messages → threads
                  <div
                    key={`${msg.postId}-${msg.otherUserId}`} // 키도 조합으로
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedMessage?.postId === msg.postId &&
                      getOtherUserId(selectedMessage) === msg.otherUserId
                        ? "bg-indigo-50 border border-indigo-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      보낸이 ID: {msg.senderId} · 게시물 ID: {msg.postId}
                    </p>
                    <p className="text-sm text-gray-800 truncate">{msg.content}</p>
                  </div>
                ))}
                {threads.length === 0 && (   // ⬅ messages.length → threads.length
                  <p className="text-gray-400 text-sm">받은 쪽지가 없습니다.</p>
                )}
              </div>
            </div>


      {/* 오른쪽: 대화/답장 */}
      <div className="w-2/3 flex flex-col">
        <h2 className="text-xl font-bold mb-2">
          쪽지 대화
          {selectedMessage && (
            <span className="ml-2 text-sm text-gray-500">
              상대 ID: {getOtherUserId(selectedMessage)} · 게시물 ID:{" "}
              {selectedMessage.postId}
            </span>
          )}
        </h2>

        <div className="flex-1 border rounded-md p-3 mb-3 overflow-y-auto bg-gray-50">
          {selectedMessage ? (
            conversation.length > 0 ? (
              conversation.map((m) => (
                <div
                  key={m.id}
                  className={`mb-2 flex ${
                    m.senderId === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      m.senderId === currentUser?.id
                        ? "bg-indigo-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    <p>{m.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">
                      {new Date(m.createdAt).toLocaleString("ko-KR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center mt-10">
                아직 대화 내역이 없습니다. 첫 쪽지를 보내보세요.
              </p>
            )
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">
              왼쪽에서 대화를 볼 쪽지를 선택하세요.
            </p>
          )}
        </div>

        {/* 답장 입력창 */}
        <form onSubmit={handleSubmitReply} className="flex space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            disabled={!selectedMessage || !replyText.trim()}
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}

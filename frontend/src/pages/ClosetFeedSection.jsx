// src/pages/ClosetFeedSection.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeartIcon } from "../components/Icons";
import { listPosts, getPost, updatePost, deletePost, createPost } from '../api/posts';
import { createComment } from "../api/comments";
// 이미지 업로드 / AI는 나중에 붙일 수 있게 일단 import만 두거나, 없으면 주석 처리해도 됨.
import { uploadImages } from "../api/files";
import { recommendSimilarPosts } from "../api/ai";
import { sendMessage } from "../api/messages";

// 버튼 스타일
const buttonClass =
  "w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const textSearchButtonClass =
  "w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const aiButtonClass =
  "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50";

export default function ClosetFeedSection({ currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const ITEMS_PER_PAGE = 5;

  const [closetItems, setClosetItems] = useState([]);
  const [closetPage, setClosetPage] = useState(() => {
    if (location.state?.itemId) return "detail";
    if (location.state?.openUpload) return "upload";
    return "list";
  });
  const [selectedItemId, setSelectedItemId] = useState(
    () => location.state?.itemId || null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //  초기 피드 로드: 백엔드 GET /posts
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        setError("");
        const data = await listPosts({ page: 0, size: 20, sort: "createdAt,desc" });

        // 백엔드는 List<Post> 배열을 바로 돌려주므로, 그대로 사용
        const items = Array.isArray(data) ? data : data?.content || [];
        setClosetItems(items);
      } catch (e) {
        console.error("Failed to load feed", e);
        setError("피드를 불러오는 중 오류가 발생했습니다.");
        setClosetItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // location.state 변화 대응 (다른 화면에서 넘어올 때)
  useEffect(() => {
    if (location.state?.itemId) {
      setSelectedItemId(location.state.itemId);
      setClosetPage("detail");
    } else if (location.state?.openUpload) {
      setClosetPage("upload");
    }
  }, [location.state]);

  // --- (1) 피드 목록 페이지 ---
  function ClosetFeedPage() {
    const [displayedItems, setDisplayedItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
      const initial = closetItems.slice(0, ITEMS_PER_PAGE);
      setDisplayedItems(initial);
      setHasMore(closetItems.length > ITEMS_PER_PAGE);
      setPage(1);
    }, [closetItems]);

    const handleLoadMore = () => {
      const nextPage = page + 1;
      const newItems = closetItems.slice(0, nextPage * ITEMS_PER_PAGE);
      setDisplayedItems(newItems);
      setPage(nextPage);
      setHasMore(closetItems.length > newItems.length);
    };

    const ClosetItemCard = ({ item }) => {
      const createdAtStr = item.createdAt
        ? new Date(item.createdAt).toLocaleString("ko-KR", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "";

      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
          {/* 이미지 영역 */}
          {item.imageUrl && (
            <div className="relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-72 object-cover cursor-pointer"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setClosetPage("detail");
                }}
              />
            </div>
          )}

          {/* 텍스트 영역 */}
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3
                className="text-lg font-bold text-gray-900 flex-1 pr-2 cursor-pointer"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setClosetPage("detail");
                }}
              >
                {item.title || "제목 없음"}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // 북마크는 로컬 토글만 (서버 연동 X)
                  setClosetItems((prev) =>
                    prev.map((it) =>
                      it.id === item.id
                        ? { ...it, isBookmarked: !it.isBookmarked }
                        : it
                    )
                  );
                }}
                className="p-1 -mt-1 -mr-1"
              >
                <HeartIcon filled={item.isBookmarked} />
              </button>
            </div>

            <p className="text-gray-700 text-sm mt-2 line-clamp-2">
              {item.content || "내용 없음"}
            </p>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{createdAtStr}</span>
              {/* 작성자 정보는 상세에서만 확실하므로 여기서는 생략 */}
            </div>

            <button
              onClick={() => {
                setSelectedItemId(item.id);
                setClosetPage("detail");
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2"
            >
              더보기...
            </button>
          </div>
        </div>
      );
    };

    if (loading) {
      return (
        <div className="text-center text-gray-500 py-10">
          피드를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-10">
          {error}
          <br />
          잠시 후 다시 시도해 주세요.
        </div>
      );
    }

    if (!closetItems.length) {
      return (
        <div className="text-center text-gray-500 py-10">
          아직 등록된 옷이 없습니다.
          <br />
          첫 옷을 등록해 보세요!
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {displayedItems.map((item) => (
          <ClosetItemCard key={item.id} item={item} />
        ))}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            더보기
          </button>
        )}
      </div>
    );
  }

  // --- (2) 옷 상세 페이지 ---
  function ItemDetailPage() {
    const [item, setItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [errorDetail, setErrorDetail] = useState("");
    const [showMessageForm, setShowMessageForm] = useState(false);
    const [messageText, setMessageText] = useState("");
    useEffect(() => {
      if (!selectedItemId) return;
      async function fetchDetail() {
        try {
          setLoadingDetail(true);
          setErrorDetail("");
          const data = await getPost(selectedItemId);
          // PostController.DetailResponse 형태
          setItem(data);
          setComments(data.comments || []);
        } catch (e) {
          console.error("failed to load post detail", e);
          setErrorDetail("게시글을 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoadingDetail(false);
        }
      }
      fetchDetail();
    }, [selectedItemId]);

    // 내가 올린 옷인지 체크 (백엔드에서 author.id 내려줌)
    const isMyItem =
      currentUser &&
      currentUser.id &&
      item &&
      item.author &&
      item.author.id === currentUser.id;

    const handleSendMessage = async (e) => {
          e.preventDefault();
          if (!messageText.trim()) {
            alert("쪽지 내용을 입력해주세요.");
            return;
          }
          if (!item?.author?.id) {
            alert("작성자 정보를 찾을 수 없습니다.");
            return;
          }

          try {
            await sendMessage({
              receiverId: item.author.id, // 옷 주인에게 보냄
              postId: item.id,            // 어느 옷에 대한 쪽지인지
              content: messageText.trim(),
            });
            alert("쪽지를 보냈습니다.");
            setMessageText("");
            setShowMessageForm(false);
          } catch (err) {
            console.error("failed to send message", err);
            alert("쪽지 전송 중 오류가 발생했습니다.");
          }
        };
    // 삭제 처리 함수
    const handleDelete = async (e) => {
      e.stopPropagation();

      if (!window.confirm("정말 이 옷 게시글을 삭제하시겠습니까?")) return;

      try {
        // 1) 백엔드에 삭제 요청
        await deletePost(item.id); // DELETE /posts/{id}

        // 2) 로컬 피드 목록에서도 제거
        setClosetItems((prev) => prev.filter((p) => p.id !== item.id));

        // 3) 피드 목록으로 이동
        alert("게시글이 삭제되었습니다.");
        setClosetPage("list");
      } catch (err) {
        console.error("failed to delete post", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    };

    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if (!newComment.trim() || !item) return;
      try {
        const saved = await createComment(item.id, newComment.trim());
        setComments((prev) => [...prev, saved]);
        setNewComment("");
      } catch (err) {
        console.error("failed to create comment", err);
        alert("댓글 작성 중 오류가 발생했습니다.");
      }
    };

    if (loadingDetail) {
      return (
        <div className="text-center text-gray-500 py-10">
          게시글을 불러오는 중입니다...
        </div>
      );
    }

    if (errorDetail || !item) {
      return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
          <button
            onClick={() => setClosetPage("list")}
            className="text-indigo-600 p-4 hover:underline"
          >
            &larr; 피드로 돌아가기
          </button>
          <div className="p-6">
            <p className="text-red-500">
              {errorDetail || "게시글을 찾을 수 없습니다."}
            </p>
          </div>
        </div>
      );
    }

    const createdAtStr = item.createdAt
      ? new Date(item.createdAt).toLocaleString("ko-KR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setClosetPage("list")}
            className="text-indigo-600 p-4 hover:underline"
          >
            &larr; 피드로 돌아가기
          </button>

          {/* ✅ 내 옷일 때만 삭제 버튼 노출 */}
          {isMyItem && (
            <button
              onClick={handleDelete}
              className="mr-4 text-sm text-red-600 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
            >
              삭제
            </button>
          )}
        </div>

        {/* 이미지 */}
        {item.imageUrl && (
          <div className="relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* 본문 */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {item.title || "제목 없음"}
              </h2>
               <div className="flex items-center space-x-2 my-4">
                <img
                  src={
                    item.author?.profileImageUrl ||
                    "https://placehold.co/40x40/E2E8F0/A0AEC0?text=U"
                  }
                  alt={item.author?.nickname}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    {item.author?.nickname || "익명"}
                  </p>
                  <p className="text-sm text-gray-500">{createdAtStr}</p>
                </div>
              </div>
              {!isMyItem && item.author?.id && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setShowMessageForm((prev) => !prev)}
                          className="text-sm text-indigo-600 border border-indigo-300 px-3 py-1 rounded hover:bg-indigo-50"
                        >
                          {showMessageForm ? "쪽지 보내기 닫기" : "이 옷 주인에게 쪽지 보내기"}
                        </button>

                        {showMessageForm && (
                          <form
                            onSubmit={handleSendMessage}
                            className="mt-3 flex space-x-2 items-center"
                          >
                            <input
                              type="text"
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="쪽지 내용을 입력하세요..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              보내기
                            </button>
                          </form>
                        )}
                      </div>
                    )}
            </div>
          </div>

          <p className="text-gray-700 mt-4 whitespace-pre-wrap">
            {item.content}
          </p>
        </div>

        {/* 댓글 */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4">
            상품 문의 ({comments.length})
          </h4>
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id}>
                <p className="font-semibold text-sm">
                  {comment.authorNickname || "익명"}
                </p>
                <p className="text-gray-700">{comment.content}</p>
                {comment.createdAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800 font-semibold transition"
            >
              등록
            </button>
          </form>
        </div>
      </div>
    );
  }



  // --- (Part 4-3) 옷 등록 페이지 ---
  function UploadClosetItemPage() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      setImageFile(file || null);
      setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      if (!title.trim()) {
        setError('옷 이름을 입력해주세요.');
        return;
      }
      if (!price.trim()) {
        setError('1일 대여 가격을 입력해주세요.');
        return;
      }

      setSubmitting(true);
      try {
        // 1) 이미지 먼저 업로드
        let imageUrl = null;
        if (imageFile) {
          const { urls } = await uploadImages([imageFile]);
          if (urls && urls.length > 0) {
            imageUrl = urls[0];
          }
        }

        // 2) /posts 에 JSON으로 저장
        const payload = {
          title: title.trim(),
          content: description.trim() || `${price.trim()}원 / 일`, // 설명 없으면 가격만이라도
          imageUrl,
        };

        await createPost(payload);
        alert('옷이 등록되었습니다!');

        // 폼 초기화
        setTitle('');
        setPrice('');
        setDescription('');
        setImageFile(null);
        setPreviewUrl(null);

        // 목록 새로고침 (선택)
        try {
          const data = await listPosts({ page: 0, size: 20, sort: 'createdAt,desc' });
          setClosetItems(data.content || data || []);
        } catch (e) {
          console.warn('피드 새로고침 실패(무시 가능):', e);
        }

        setClosetPage('list');
      } catch (e) {
        console.error('옷 등록 중 오류', e);
        setError('옷 등록 중 오류가 발생했습니다.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button
          onClick={() => setClosetPage('list')}
          className="text-indigo-600 mb-4 hover:underline"
        >
          &larr; 피드로 돌아가기
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          내 옷 등록하기
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              옷 이름
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: 봄 트렌치 코트 (M)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              사진 등록
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="미리보기"
                className="mt-3 w-full h-64 object-cover rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              1일 대여 가격 (원)
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: 5000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              상세 설명
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              placeholder="예: 브랜드, 사이즈, 옷 상태, 구매 시기 등"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm italic mt-1">{error}</p>
          )}

          <button type="submit" className={buttonClass} disabled={submitting}>
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    );
  }



  // --- (4) 텍스트 검색 페이지 (로컬 filter) ---
  function ClosetTextSearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
      e.preventDefault();
      const q = query.trim().toLowerCase();
      if (!q) {
        setResults([]);
        return;
      }
      const filtered = closetItems.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.content || "").toLowerCase().includes(q)
      );
      setResults(filtered);
    };

    return (
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-l-lg rounded-r-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="예: '트렌치 코트'"
          />
          <button type="submit" className={textSearchButtonClass}>
            텍스트 검색
          </button>
        </form>
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className="flex bg-white p-4 rounded-lg shadow-md items-center cursor-pointer hover:shadow-lg"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setClosetPage("detail");
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover mr-4"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.title || "제목 없음"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(item.content || "").slice(0, 40)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

    // --- (5) AI 검색 페이지 ---
    function ClosetAiSearchPage() {
      const [results, setResults] = useState([]);
      const [isSearching, setIsSearching] = useState(false);
      const [preview, setPreview] = useState(null);
      const fileInputRef = useRef(null);

      const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          setPreview(URL.createObjectURL(file)); // 화면에 보여줄 미리보기
        } else {
          setPreview(null);
        }
      };

      const handleAiSearch = async (e) => {
        e.preventDefault();

        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          alert("유사한 옷을 찾을 사진을 업로드해주세요.");
          return;
        }

        try {
          setIsSearching(true);

          // 1) 우리 백엔드에 이미지 업로드해서 URL 받기
          const { urls } = await uploadImages([file]);   // /files 업로드 API
          const imageUrl = urls?.[0];
          if (!imageUrl) {
            throw new Error("이미지 업로드에 실패했습니다.");
          }

          // 2) 그 URL을 가지고 스프링 → AI 서버로 추천 요청
          const posts = await recommendSimilarPosts(imageUrl, 5); // POST /ai/recommend

          // 3) 결과 세팅 (posts 는 List<Post> 라고 가정)
          setResults(Array.isArray(posts) ? posts : []);
        } catch (err) {
          console.error("AI 검색 중 오류", err);
          alert("AI 검색 중 오류가 발생했습니다.");
        } finally {
          setIsSearching(false);
        }
      };


      return (
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleAiSearch}
            className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              AI 유사 의류 검색
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              가지고 있는 옷 사진을 업로드하면, 비슷한 스타일의 옷을 찾아줍니다.
            </p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4"
            />
            {preview && (
              <img
                src={preview}
                alt="업로드 미리보기"
                className="w-32 h-32 object-cover mx-auto rounded-lg mb-4"
              />
            )}
            <button
              type="submit"
              className={aiButtonClass}
              disabled={isSearching}
            >
              {isSearching ? "비슷한 옷 찾는 중..." : "AI로 찾기"}
            </button>
          </form>

          <h4 className="text-lg font-semibold mb-4">검색 결과:</h4>
          <div className="space-y-4">
            {isSearching && (
              <p className="text-gray-500 text-center">검색 중...</p>
            )}
            {results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  className="flex bg-white p-4 rounded-lg shadow-md items-center cursor-pointer hover:shadow-lg"
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setClosetPage("detail");
                  }}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover mr-4"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {item.title || "제목 없음"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(item.content || "").slice(0, 40)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              !isSearching && (
                <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
              )
            )}
          </div>
        </div>
      );
    }



  // --- 메인 렌더링 ---
  return (
    <div className="w-full flex flex-col">
      <nav className="w-full bg-white shadow-md mb-8 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="space-x-6">
            <button
              onClick={() => setClosetPage("list")}
              className={`font-semibold text-lg ${
                closetPage === "list"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600"
              }`}
            >
              피드
            </button>
            <button
              onClick={() => setClosetPage("text-search")}
              className={`font-semibold text-lg ${
                closetPage === "text-search"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600"
              }`}
            >
              텍스트 검색
            </button>
            <button
              onClick={() => setClosetPage("ai-search")}
              className={`font-semibold text-lg ${
                closetPage === "ai-search"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600"
              }`}
            >
              AI 검색
            </button>
          </div>
          <button
            onClick={() => setClosetPage("upload")}
            className={buttonClass}
          >
            + 내 옷 등록
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 pb-8 flex-grow">
        {closetPage === "list" && <ClosetFeedPage />}
        {closetPage === "detail" && <ItemDetailPage />}
        {closetPage === "upload" && <UploadClosetItemPage />}
        {closetPage === "text-search" && <ClosetTextSearchPage />}
        {closetPage === "ai-search" && <ClosetAiSearchPage />}
      </main>
    </div>
  );
}

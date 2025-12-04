import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookmarkIcon } from '../components/Icons'; 
import {
  listCommunityPosts,
  getCommunityPost,
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  createCommunityComment,
  createCommunityPost,
  deleteCommunityPost,
} from '../api/community';
import { uploadImages } from '../api/files';
// ★ 그라데이션 버튼 스타일
const buttonClass =
  'w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';
const textSearchButtonClass =
  'w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';
const uploadButtonClass =
  'w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';

// 1. App.jsx로부터 props 받기
//   - socialPosts: 혹시 모를 fallback용 (API 실패 시 사용 가능)
//   - onToggleSave: 북마크(저장) 기능은 일단 그대로 두고, 로컬 상태 기반
export default function SocialFeedSection({ socialPosts = [], onToggleSave, currentUser, }) {
  const POSTS_PER_PAGE = 4;
  const location = useLocation();
  const navigate = useNavigate();

  // 화면 상태
  const [socialPage, setSocialPage] = useState('list');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  // 데이터 상태
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 초기 로딩
  useEffect(() => {
    if (location.state?.postId) {
      setSelectedPostId(location.state.postId);
      setSocialPage('detail');
    } else if (location.state?.openUpload) {
      setEditTarget(null);
      setSocialPage('upload');
    }
  }, [location.state]);

  // ★ 목록 조회
  useEffect(() => {
    if (socialPage !== 'list') return;

    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await listCommunityPosts({
          page: 0,
          size: 20,
          sort: 'createdAt,desc'
        });

        if (Array.isArray(data)) {
          setPosts(data);
        } else if (data && data.content) {
          setPosts(data.content);
        } else {
          setPosts([]);
        }
      } catch (e) {
        console.error(e);
        setError('글 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [socialPage]); 

  // --- [1] 목록 페이지 ---
  function SocialFeedPage() {
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
      setDisplayedPosts(posts.slice(0, POSTS_PER_PAGE));
      setHasMore(posts.length > POSTS_PER_PAGE);
      setPage(1);
    }, [posts]);

    const handleLoadMore = () => {
      const nextPage = page + 1;
      const newPosts = posts.slice(0, nextPage * POSTS_PER_PAGE);
      setDisplayedPosts(newPosts);
      setPage(nextPage);
      setHasMore(posts.length > newPosts.length);
    };

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-10">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            등록된 글이 없습니다. 첫 글을 남겨보세요!
          </div>
        ) : (
          displayedPosts.map(post => (
            <div
              key={post.id}
              onClick={() => { setSelectedPostId(post.id); setSocialPage('detail'); }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              {post.thumbnailUrl && (
                <img src={post.thumbnailUrl} alt={post.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    {post.authorNickname || '익명'}
                  </span>
                  <div className="flex items-center space-x-1 text-gray-400 text-sm">
                      <span>♥ {post.likeCount || 0}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                <p className="text-gray-700 text-sm my-2 truncate">{post.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(post.createdAt).toLocaleDateString()} · 댓글 {post.commentCount || 0}
                </div>
              </div>
            </div>
          ))
        )}
        
        {hasMore && !loading && (
          <button onClick={handleLoadMore} className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300">
            더보기
          </button>
        )}
      </div>
    );
  }

  // --- [2] 상세 페이지 ---
  function SocialPostDetailPage() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]); 
    const [newComment, setNewComment] = useState('');
    
    // 시연용: 내 ID = 1
    const CURRENT_USER_ID = 1; 

    useEffect(() => {
      if (!selectedPostId) return;
      
      getCommunityPost(selectedPostId).then(data => {
        setPost(data);
        // 상세 조회 응답에 댓글이 포함된 경우 [cite: 138]
        if (data.comments) setComments(data.comments);
        // 또는 댓글 목록 API를 별도로 호출 [cite: 20]
        else {
           listCommunityComments(selectedPostId).then(setComments).catch(() => {});
        }
      }).catch(err => alert('글을 불러오지 못했습니다.'));

    }, [selectedPostId]);

    const handleCommentSubmit = async (e) => {
      e.preventDefault();
      if(!newComment.trim()) return;
      try {
        const saved = await createCommunityComment(post.id, newComment);
        setComments([...comments, saved]);
        setNewComment('');
      } catch(e) { 
        console.error(e);
        alert('댓글 등록 실패: 로그인 상태나 서버를 확인해주세요.'); 
      }
    };
    const handleDeletePost = async () => {
      if (!window.confirm("정말 삭제하시겠습니까?")) return;

      try {

        await deleteCommunityPost(post.id);

        alert("삭제되었습니다.");
        setSocialPage("list");

        // 목록에서 바로 지우고 싶으면 아래까지 해줘도 됨
        setPosts(prev => prev.filter(p => p.id !== post.id));
      } catch (e) {
        console.error("삭제 실패", e);
        // 상태 코드까지 확인해보자 (권한 문제 등)
        if (e.response) {
          console.error("status:", e.response.status, "data:", e.response.data);
        }
        alert("삭제 중 오류가 발생했습니다.");
      }
    };



    // (쪽지 보내기 핸들러 삭제됨)

    const handleDeleteComment = async (commentId) => {
        if(!window.confirm('댓글을 삭제할까요?')) return;
        try {
            await deleteCommunityComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch(e) { alert('삭제 실패'); }
    };

    const handleDeletePost = async () => {
      if(window.confirm('게시글을 삭제하시겠습니까?')) {
        await deleteCommunityPost(post.id);
        setSocialPage('list');
      }
    };

    const handleLike = async () => {
        try {
            const res = await toggleCommunityLike(post.id);
            // 좋아요 응답 예시: { postId: 1, likeCount: 13, liked: true }
            setPost(prev => ({ ...prev, likeCount: res.likeCount, liked: res.liked }));
        } catch(e) { alert('좋아요 실패'); }
    };

    if (!post) return <div className="p-10 text-center">로딩 중...</div>;
    
    // 이 부분은 인증 시스템 구현 시 실제 사용자 ID로 변경해야 함.
    const isMyPost = post.authorId === CURRENT_USER_ID;

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* 상단 네비게이션 */}
        <div className="flex justify-between p-4 border-b items-center">
          <button onClick={() => setSocialPage('list')} className="text-indigo-600 hover:underline">&larr; 목록</button>
          
          <div className="flex gap-2">
            {isMyPost && (
              <>
                <button onClick={() => { setEditTarget(post); setSocialPage('upload'); }} className="px-3 py-1 bg-gray-100 rounded text-sm font-bold">수정</button>
                <button onClick={handleDeletePost} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm font-bold">삭제</button>
              </>
            )}
          </div>
        </div>
      );
    }
    // 내가 쓴 커뮤니티 글인지 체크
    const isMyPost =
      currentUser &&
      currentUser.id &&
      post &&
      (post.authorId === currentUser.id || post.author?.id === currentUser.id);

        {/* 본문 영역 */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
              커뮤니티
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onToggleSave && onToggleSave(post.id)}
                className="p-1"
              >
                <BookmarkIcon filled={post.isSaved} className="w-7 h-7" />
              </button>

              {/* 🔥 삭제 버튼: 본인 글일 때만 표시 */}
              {isMyPost && (
                <button
                  onClick={handleDeletePost}
                  className="text-red-500 border border-red-400 px-3 py-1 rounded hover:bg-red-50"
                >
                  삭제
                </button>
              )}
            </div>

            </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            {post.title}
          </h2>
          <div className="flex items-center space-x-2 my-4">
            <img
              src={
                post.profilePic ||
                'https://placehold.co/40x40/E2E8F0/A0AEC0?text=U'
              }
              alt={post.authorNickname}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">
                {post.authorNickname || '익명'}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString('ko-KR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 bg-gray-50 -mx-6 px-6 pb-6">
            <h3 className="font-bold mb-4 text-lg">댓글 ({post.commentCount || comments.length})</h3>
            
            <div className="space-y-3 mb-6">
                {comments.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold text-indigo-900">{c.authorNickname}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{c.content}</p>
                    
                    {c.authorId === CURRENT_USER_ID && (
                        <button 
                            onClick={() => handleDeleteComment(c.id)} 
                            className="absolute top-3 right-3 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                        >
                            삭제
                        </button>
                    )}
                </div>
                ))}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)} 
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="따뜻한 댓글을 남겨주세요" 
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-lg transition-colors">
                등록
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- (Part 5-3) 자유 커뮤니티 글쓰기 ---

  function UploadSocialPostPage() {
    const [category, setCategory] = useState("스타일링 가이드");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files || []);
      setImageFiles(files);
      setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!title.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }
      if (!content.trim()) {
        setError("내용을 입력해주세요.");
        return;
      }

      setSubmitting(true);
      try {
        // 1) 이미지 업로드
        let imageUrls = [];
        if (imageFiles.length > 0) {
          const res = await uploadImages(imageFiles);
          if (res.urls && res.urls.length > 0) {
            imageUrls = res.urls;
          }
        }

        // 2) 커뮤니티 글 생성
        const payload = {
          title: `[${category}] ${title.trim()}`,
          content: content.trim(),
          imageUrls,
        };
        await createCommunityPost(payload);

        alert("커뮤니티 글이 등록되었습니다! (새로고침하면 목록에 보입니다.)");

        // 폼 초기화 + 목록 화면으로
        setCategory("스타일링 가이드");
        setTitle("");
        setContent("");
        setImageFiles([]);
        setPreviewUrls([]);
        setSocialPage("list");
      } catch (e) {
        console.error("failed to create community post", e);
        setError("커뮤니티 글 등록 중 오류가 발생했습니다.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button
          onClick={() => setSocialPage("list")}
          className="text-indigo-600 mb-4 hover:underline"
        >
          &larr; 커뮤니티로 돌아가기
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          커뮤니티 글쓰기
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              카테고리
            </label>
            <select
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>스타일링 가이드</option>
              <option>면접 코디</option>
              <option>졸업식 코디</option>
              <option>코디 질문</option>
              <option>OOTD</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              제목
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border rounded-lg"
              placeholder="예: 가을 캠퍼스룩 추천"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              사진 등록 (선택)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previewUrls.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="미리보기"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              내용
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg"
              rows="6"
              placeholder="예: 가을에 입기 좋은 5가지 아이템을 소개합니다..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          {error && (
            <p className="text-red-500 text-sm italic mt-1">{error}</p>
          )}

          <button
            type="submit"
            className={uploadButtonClass}
            disabled={submitting}
          >
            {submitting ? "올리는 중..." : "글 올리기"}
          </button>
        </form>
      </div>
    );
  }


  // --- (Part 5-4) 텍스트 검색 페이지 ---
  function SocialTextSearchPage() {
    const [q, setQ] = useState('');
    const [res, setRes] = useState([]);
    const handleSearch = (e) => {
      e.preventDefault();
      const filtered = posts.filter(p => p.title.includes(q) || p.content.includes(q));
      setRes(filtered);
    };
    return (
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex mb-4">
          <input value={q} onChange={e => setQ(e.target.value)} className="flex-1 border p-2 rounded-l" placeholder="검색어" />
          <button className={textSearchButtonClass}>검색</button>
        </form>
        {res.map(p => (
          <div key={p.id} onClick={() => { setSelectedPostId(p.id); setSocialPage('detail'); }} className="bg-white p-3 mb-2 rounded shadow cursor-pointer">
            <h3 className="font-bold">{p.title}</h3>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <nav className="bg-white shadow mb-8 sticky top-0 z-10 px-6 py-4 flex justify-between">
        <div className="space-x-4">
          <button onClick={() => setSocialPage('list')} className={`font-bold ${socialPage==='list'?'text-indigo-600':'text-gray-500'}`}>커뮤니티 홈</button>
          <button onClick={() => setSocialPage('search')} className={`font-bold ${socialPage==='search'?'text-indigo-600':'text-gray-500'}`}>검색</button>
        </div>
        <button onClick={() => { setEditTarget(null); setSocialPage('upload'); }} className={buttonClass}>+ 글쓰기</button>
      </nav>
      <main className="container mx-auto px-4 pb-10">
        {socialPage === 'list' && <SocialFeedPage />}
        {socialPage === 'detail' && <SocialPostDetailPage />}
        {socialPage === 'upload' && <UploadSocialPostPage />}
        {socialPage === 'search' && <SocialTextSearchPage />}
      </main>
    </div>
  );
}

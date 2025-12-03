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
  deleteCommunityComment,
  toggleCommunityLike,
  listCommunityComments
  
} from '../api/community';

// ⭐ API 목업: 실제로는 ../api/community에 POST /files/images 로 구현해야 합니다.
// [cite: 167, 168]을 참고하여 files 배열을 받아 URL 배열을 반환한다고 가정합니다.
const uploadImageFiles = async (files) => {
    console.log(`[Mock API] Uploading ${files.length} files...`);
    // 실제 서버 통신 코드가 들어갈 자리입니다. (e.g., Axios post with FormData)
    await new Promise(resolve => setTimeout(resolve, 800)); // 통신 지연 시뮬레이션
    
    // 서버가 URL을 반환하는 형식 시뮬레이션 
    return files.map((file, index) => 
        `http://localhost:8080/files/mock-${Date.now()}-${index}-${file.name}`
    );
};

// 스타일
const buttonClass = 'w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';
const textSearchButtonClass = 'w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';
const uploadButtonClass = 'w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300';

export default function SocialFeedSection({ onToggleSave }) {
  const POSTS_PER_PAGE = 5;
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

        {/* 본문 영역 */}
        <div className="p-6">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <div className="flex justify-between items-center text-gray-500 text-sm mb-4 mt-2">
              <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{post.authorNickname}</span>
              </div>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          
          {/* 이미지 표시 로직 (API 응답의 imageUrls 필드 사용) */}
          {post.imageUrls?.map((url, i) => (
            <img key={i} src={url} className="w-full rounded mb-4 object-cover max-h-96" alt="게시글 이미지" />
          ))}
          
          <p className="whitespace-pre-wrap text-gray-800 my-6 min-h-[100px] leading-relaxed">{post.content}</p>
          
          <div className="text-center mb-6">
              <button onClick={handleLike} className={`px-6 py-2 rounded-full border transition-all ${post.liked ? 'bg-red-50 border-red-200 text-red-500 shadow-sm' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                  ♥ 좋아요 {post.likeCount}
              </button>
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

  // --- [3] 글쓰기/수정 페이지 (이미지 처리 로직 추가) ---
  function UploadSocialPostPage() {
    const isEdit = !!editTarget;
    const [title, setTitle] = useState(isEdit ? editTarget.title : '');
    const [content, setContent] = useState(isEdit ? editTarget.content : '');
    // ⭐ 새로 추가된 상태: 사용자가 선택한 파일 객체 목록
    const [filesToUpload, setFilesToUpload] = useState([]);
    // ⭐ 새로 추가된 상태: 수정 시 기존 이미지 URL 목록
    const [existingImageUrls, setExistingImageUrls] = useState(isEdit ? (editTarget.imageUrls || []) : []);
    const [isUploading, setIsUploading] = useState(false); // 업로드 중 상태

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        // 기존 파일에 새로 선택한 파일을 추가 (필요하다면 용량/개수 제한 로직 추가)
        setFilesToUpload(prev => [...prev, ...selectedFiles]); 
        e.target.value = null; // 같은 파일을 다시 선택할 수 있도록 초기화
    };

    // 이미지 프리뷰 URL 정리 (메모리 누수 방지)
    useEffect(() => {
        return () => {
            filesToUpload.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [filesToUpload]);
    
    // 이미지 삭제 핸들러 (업로드 예정인 파일 삭제)
    const removeFileToUpload = (index) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    // 이미지 삭제 핸들러 (기존 이미지 URL 삭제)
    const removeExistingImageUrl = (urlToRemove) => {
        setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
    };


    const handleSubmit = async (e) => {
      e.preventDefault();
      
      let finalImageUrls = existingImageUrls;

      try {
        setIsUploading(true);
        
        // 1. 새 파일이 있다면 먼저 업로드하여 URL을 받습니다.
        if (filesToUpload.length > 0) {
            console.log('새 이미지 파일 업로드 시작...');
            const uploadedUrls = await uploadImageFiles(filesToUpload); // ⭐  API 호출
            console.log('업로드 완료:', uploadedUrls);
            
            // 2. 기존 URL 목록과 새로 업로드된 URL 목록을 합칩니다.
            finalImageUrls = [...existingImageUrls, ...uploadedUrls];
        }
        
        // 3. 게시글 Payload 준비
        const payload = { 
            title, 
            content, 
            imageUrls: finalImageUrls, // ⭐ URL 목록 포함 
            // 필요한 경우 pricePerDay, size, category 등 옷 공유 관련 필드도 포함
        };

        // 4. 게시글 생성/수정 API 호출
        if (isEdit) {
            await updateCommunityPost(editTarget.id, payload); // PATCH /community/posts/{postId}
        } else {
            await createCommunityPost(payload); // POST /community/posts
        }
        
        alert('완료되었습니다!');
        // 글 작성 후 목록으로 돌아가는 대신 상세 페이지로 이동하거나,
        // 현재는 간단히 목록으로 이동합니다.
        setSocialPage('list'); 

      } catch (e) { 
        console.error(e);
        alert('오류가 발생했습니다: ' + e.message); 
      } finally {
          setIsUploading(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow-lg">
        <button onClick={() => setSocialPage('list')} className="mb-4 text-indigo-600">&larr; 취소</button>
        <h2 className="text-2xl font-bold mb-6">{isEdit ? '글 수정' : '커뮤니티 글쓰기'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="제목" 
            className="w-full border p-2 rounded" 
            required 
            disabled={isUploading}
          />
          
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            rows="5" 
            placeholder="내용" 
            className="w-full border p-2 rounded" 
            required 
            disabled={isUploading}
          />

          {/* ⭐ 이미지 업로드 UI */}
          <div className="pt-4 border-t">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">이미지 추가 (최대 5개)</label>
              <input 
                  id="file-upload"
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  className="w-full border p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={isUploading}
              />
              
              {/* ⭐ 이미지 프리뷰 영역 */}
              <div className="mt-4 flex flex-wrap gap-3">
                  {/* 기존 이미지 프리뷰 */}
                  {existingImageUrls.map((url, index) => (
                      <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                          <img src={url} alt={`기존 이미지 ${index}`} className="w-full h-full object-cover" />
                          <button 
                              type="button" 
                              onClick={() => removeExistingImageUrl(url)} 
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 text-xs font-bold"
                          >
                              X
                          </button>
                      </div>
                  ))}

                  {/* 새로 선택된 파일 프리뷰 */}
                  {filesToUpload.map((file, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-indigo-500 opacity-80">
                          {/* 임시 URL 생성 */}
                          <img 
                              src={URL.createObjectURL(file)} 
                              alt={`업로드 예정 ${index}`} 
                              className="w-full h-full object-cover" 
                          />
                          <button 
                              type="button" 
                              onClick={() => removeFileToUpload(index)} 
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 text-xs font-bold"
                          >
                              X
                          </button>
                          <span className="absolute bottom-0 left-0 bg-indigo-500 text-white text-xs px-1">NEW</span>
                      </div>
                  ))}
              </div>
          </div>
          
          <button 
            type="submit" 
            className={uploadButtonClass} 
            disabled={isUploading || title.trim() === '' || content.trim() === ''} // 제목/내용이 비었거나 업로드 중일 때 비활성화
          >
            {isUploading ? '이미지 업로드 중...' : (isEdit ? '수정 완료' : '등록하기')}
          </button>
        </form>
      </div>
    );
  }

  // --- [4] 검색 페이지 ---
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

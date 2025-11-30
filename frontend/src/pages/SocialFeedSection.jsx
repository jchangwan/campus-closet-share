import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookmarkIcon } from '../components/Icons';
import {
  listCommunityPosts,
  getCommunityPost,
  createCommunityComment,
} from '../api/community';

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
export default function SocialFeedSection({ socialPosts = [], onToggleSave }) {
  const POSTS_PER_PAGE = 4;
  const location = useLocation();
  const navigate = useNavigate();

  // 어떤 화면인지 (목록/상세/글쓰기/검색)
  const [socialPage, setSocialPage] = useState(() => {
    if (location.state?.postId) return 'detail'; // 1. postId 있으면 상세페이지
    if (location.state?.openUpload) return 'upload'; // 2. 글쓰기 요청이면 글쓰기
    return 'list'; // 3. 아니면 목록
  });

  const [selectedPostId, setSelectedPostId] = useState(
    () => location.state?.postId || null,
  );

  // 커뮤니티 글 목록 (실제 API에서 가져옴)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // location.state가 바뀔 때마다 페이지 전환
  useEffect(() => {
    if (location.state?.postId) {
      setSelectedPostId(location.state.postId);
      setSocialPage('detail');
    } else if (location.state?.openUpload) {
      setSocialPage('upload');
    }
  }, [location.state]);

  // ★ 커뮤니티 목록 API 호출
  useEffect(() => {
    async function fetchCommunityPosts() {
      try {
        setLoading(true);
        setError(null);
        // page=0, size=20, sort=latest 기준
        const data = await listCommunityPosts({
          page: 0,
          size: 20,
          sort: 'latest',
        });

        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts([]);
        }
      } catch (e) {
        console.error('커뮤니티 목록 조회 실패:', e);
        setError('커뮤니티 글을 불러오는 중 오류가 발생했습니다.');
        // 필요하면 mock 데이터 fallback
        // setPosts(socialPosts || []);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunityPosts();
  }, [socialPosts]);

  // --- (Part 5-1) 자유 커뮤니티 피드 (목록) ---
  function SocialFeedPage() {
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
      const initialPosts = posts.slice(0, POSTS_PER_PAGE);
      setDisplayedPosts(initialPosts);
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

    const SocialPostCard = ({ post }) => (
      <div
        onClick={() => {
          setSelectedPostId(post.id);
          setSocialPage('detail');
        }}
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      >
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
              커뮤니티
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleSave && onToggleSave(post.id);
              }}
              className="p-1 -mt-1 -mr-1"
            >
              <BookmarkIcon filled={post.isSaved} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
          <p className="text-gray-700 text-sm my-2 truncate">
            {post.content}
          </p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <img
                src={
                  post.profilePic ||
                  'https://placehold.co/40x40/E2E8F0/A0AEC0?text=U'
                }
                alt={post.authorNickname}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">
                  {post.authorNickname || '익명'}
                </p>
                {/* author university 정보가 없어서 생략 */}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString('ko-KR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>
      </div>
    );

    if (loading) {
      return (
        <div className="text-center text-gray-500 py-10">
          커뮤니티 글을 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-10">
          {error}
          <br />
          잠시 후 다시 시도해보세요.
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="text-center text-gray-500 py-10">
          아직 등록된 커뮤니티 글이 없습니다.
          <br />
          첫 글을 올려보세요!
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {displayedPosts.map(post => (
          <SocialPostCard key={post.id} post={post} />
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

  // --- (Part 5-2) 자유 커뮤니티 상세 ---
  function SocialPostDetailPage() {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [errorDetail, setErrorDetail] = useState(null);

    useEffect(() => {
      if (!selectedPostId) return;
      async function fetchDetail() {
        try {
          setLoadingDetail(true);
          setErrorDetail(null);
          const data = await getCommunityPost(selectedPostId);
          setPost(data);
          setComments(data.comments || []);
        } catch (e) {
          console.error('커뮤니티 상세 조회 실패:', e);
          setErrorDetail('게시글을 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoadingDetail(false);
        }
      }
      fetchDetail();
    }, [selectedPostId]);

    const handleCommentSubmit = async e => {
      e.preventDefault();
      if (!newComment.trim() || !post) return;
      try {
        const saved = await createCommunityComment(post.id, newComment.trim());
        setComments(prev => [...prev, saved]);
        setNewComment('');
      } catch (e) {
        console.error('댓글 작성 실패:', e);
        alert('댓글 작성 중 오류가 발생했습니다.');
      }
    };

    if (loadingDetail) {
      return (
        <div className="text-center text-gray-500 py-10">
          게시글을 불러오는 중입니다...
        </div>
      );
    }

    if (errorDetail || !post) {
      return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
          <button
            onClick={() => setSocialPage('list')}
            className="text-indigo-600 p-4 hover:underline"
          >
            &larr; 커뮤니티로 돌아가기
          </button>
          <div className="p-6">
            <p className="text-red-500">
              {errorDetail || '게시글을 찾을 수 없습니다.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <button
          onClick={() => setSocialPage('list')}
          className="text-indigo-600 p-4 hover:underline"
        >
          &larr; 커뮤니티로 돌아가기
        </button>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
              커뮤니티
            </span>
            <button
              onClick={() => onToggleSave && onToggleSave(post.id)}
              className="p-1"
            >
              <BookmarkIcon filled={post.isSaved} className="w-7 h-7" />
            </button>
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
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">
            {post.content}
          </p>
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="space-y-3 my-4">
              {post.imageUrls.map(url => (
                <img
                  key={url}
                  src={url}
                  alt={post.title}
                  className="w-full h-auto object-contain rounded-md"
                />
              ))}
            </div>
          )}
        </div>
        {/* 댓글 섹션 */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4">
            댓글 ({comments.length})
          </h4>
          <div className="space-y-4 mb-4">
            {comments.map(comment => (
              <div key={comment.id}>
                <p className="font-semibold text-sm">
                  {comment.authorNickname || '익명'}
                </p>
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString('ko-KR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
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

  // --- (Part 5-3) 자유 커뮤니티 글쓰기 ---
  // ※ 아직 API에 연결하지 않은 상태. 나중에 createCommunityPost + /files/images 연동 가능.
  function UploadSocialPostPage() {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button
          onClick={() => setSocialPage('list')}
          className="text-indigo-600 mb-4 hover:underline"
        >
          &larr; 커뮤니티로 돌아가기
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          커뮤니티 글쓰기
        </h2>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              카테고리
            </label>
            <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              사진 등록 (선택)
            </label>
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              내용
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg"
              rows="6"
              placeholder="예: 가을에 입기 좋은 5가지 아이템을 소개합니다..."
            ></textarea>
          </div>
          <button type="submit" className={uploadButtonClass}>
            글 올리기
          </button>
        </form>
      </div>
    );
  }

  // --- (Part 5-4) 텍스트 검색 페이지 ---
  function SocialTextSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = e => {
      e.preventDefault();
      const q = query.trim().toLowerCase();
      if (!q) {
        setResults([]);
        return;
      }
      const filtered = posts.filter(
        post =>
          post.title.toLowerCase().includes(q) ||
          post.content.toLowerCase().includes(q),
      );
      setResults(filtered);
    };

    return (
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-l-lg rounded-r-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="예: '면접' 또는 '가을 코디'"
          />
          <button type="submit" className={textSearchButtonClass}>
            텍스트 검색
          </button>
        </form>
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map(post => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg"
                onClick={() => {
                  setSelectedPostId(post.id);
                  setSocialPage('detail');
                }}
              >
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                  커뮤니티
                </span>
                <h3 className="font-semibold text-gray-800">{post.title}</h3>
                <p className="text-sm text-gray-600 truncate">
                  {post.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }

  // --- (Part 5) 자유 커뮤니티 섹션 메인 렌더링 ---
  return (
    <div className="w-full flex flex-col">
      <nav className="w-full bg-white shadow-md mb-8 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="space-x-6">
            <button
              onClick={() => setSocialPage('list')}
              className={`font-semibold text-lg ${
                socialPage === 'list'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              커뮤니티 홈
            </button>
            <button
              onClick={() => setSocialPage('search')}
              className={`font-semibold text-lg ${
                socialPage === 'search'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600'
              }`}
            >
              텍스트 검색
            </button>
          </div>
          <button
            onClick={() => setSocialPage('upload')}
            className={buttonClass}
          >
            + 글쓰기
          </button>
        </div>
      </nav>
      <main className="container mx-auto px-4 sm:px-6 pb-8 flex-grow">
        {socialPage === 'list' && <SocialFeedPage />}
        {socialPage === 'detail' && <SocialPostDetailPage />}
        {socialPage === 'upload' && <UploadSocialPostPage />}
        {socialPage === 'search' && <SocialTextSearchPage />}
      </main>
    </div>
  );
}

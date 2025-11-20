import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from '../components/Icons';
import { mockUser, mockSocialComments } from '../data/mockData';

// ★ 그라데이션 버튼 스타일
const buttonClass = "w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const textSearchButtonClass = "w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const uploadButtonClass = "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

// 1. App.jsx로부터 props 받기 - ★★★ 여기에 'default'가 있어야 합니다! ★★★
export default function SocialFeedSection({ socialPosts, onToggleSave }) {
  const [socialPage, setSocialPage] = useState('list'); 
  const [selectedPostId, setSelectedPostId] = useState(null);
  const POSTS_PER_PAGE = 4; 
  
  // --- (Part 5-1) 자유 커뮤니티 피드 ---
  function SocialFeedPage() {
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
      const initialPosts = socialPosts.slice(0, POSTS_PER_PAGE);
      setDisplayedPosts(initialPosts);
      setHasMore(socialPosts.length > POSTS_PER_PAGE);
    }, [socialPosts]); 
    const handleLoadMore = () => {
      const nextPage = page + 1;
      const newPosts = socialPosts.slice(0, nextPage * POSTS_PER_PAGE);
      setDisplayedPosts(newPosts);
      setPage(nextPage);
      setHasMore(socialPosts.length > newPosts.length);
    };

    const SocialPostCard = ({ post }) => (
      <div onClick={() => { setSelectedPostId(post.id); setSocialPage('detail'); }} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300">
        {post.imageUrl && (<img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />)}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">{post.category}</span>
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(post.id); }} className="p-1 -mt-1 -mr-1">
              <BookmarkIcon filled={post.isSaved} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
          <p className="text-gray-700 text-sm my-2 truncate">{post.content}</p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2"><img src={post.profilePic} alt={post.author} className="w-8 h-8 rounded-full" /><div><p className="font-semibold text-sm">{post.author}</p><p className="text-xs text-gray-500">{post.university}</p></div></div>
            <span className="text-sm text-gray-500">{post.createdAt}</span>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {displayedPosts.map(post => <SocialPostCard key={post.id} post={post} />)}
        {hasMore && (<button onClick={handleLoadMore} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300">더보기</button>)}
      </div>
    );
  }
  
  // --- (Part 5-2) 자유 커뮤니티 상세 ---
  function SocialPostDetailPage() {
    const post = socialPosts.find(p => p.id === selectedPostId); 
    const [comments, setComments] = useState(mockSocialComments[selectedPostId] || []);
    const [newComment, setNewComment] = useState('');
    
    if (!post) return <p>게시글을 찾을 수 없습니다.</p>;
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if(!newComment.trim()) return;
        const commentToAdd = { id: Date.now(), author: mockUser.name, text: newComment };
        setComments([...comments, commentToAdd]);
        setNewComment('');
    };
    
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <button onClick={() => setSocialPage('list')} className="text-indigo-600 p-4 hover:underline">&larr; 커뮤니티로 돌아가기</button>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">{post.category}</span>
            <button onClick={() => onToggleSave(post.id)}>
              <BookmarkIcon filled={post.isSaved} className="w-7 h-7" />
            </button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{post.title}</h2>
          <div className="flex items-center space-x-2 my-4"><img src={post.profilePic} alt={post.author} className="w-10 h-10 rounded-full" /><div><p className="font-semibold">{post.author}</p><p className="text-sm text-gray-500">{post.university} · {post.createdAt}</p></div></div>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (<img src={post.imageUrl} alt={post.title} className="w-full h-auto object-contain rounded-md my-4" />)}
        </div>
        {/* 댓글 섹션 */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4">댓글 ({comments.length})</h4>
          <div className="space-y-4 mb-4">
            {comments.map(comment => (<div key={comment.id}><p className="font-semibold text-sm">{comment.author}</p><p className="text-gray-700">{comment.text}</p></div>))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 입력하세요..." className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800 font-semibold transition">등록</button>
          </form>
        </div>
      </div>
    );
  }
  
  // --- (Part 5-3) 자유 커뮤니티 글쓰기 ---
  function UploadSocialPostPage() { 
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button onClick={() => setSocialPage('list')} className="text-indigo-600 mb-4 hover:underline">&larr; 커뮤니티로 돌아가기</button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">커뮤니티 글쓰기</h2>
        <form className="space-y-6">
          {/* (폼 내용 생략) */}
          <div><label className="block text-gray-700 text-sm font-bold mb-2">카테고리</label><select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"><option>스타일링 가이드</option><option>면접 코디</option><option>졸업식 코디</option><option>코디 질문</option><option>OOTD</option></select></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">제목</label><input type="text" className="w-full px-4 py-3 border rounded-lg" placeholder="예: 가을 캠퍼스룩 추천" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">사진 등록 (선택)</label><input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">내용</label><textarea className="w-full px-4 py-3 border rounded-lg" rows="6" placeholder="예: 가을에 입기 좋은 5가지 아이템을 소개합니다..."></textarea></div>
          {/* ★ 2. 버튼 스타일 적용 */}
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
    const handleSearch = (e) => {
      e.preventDefault();
      const fakeResults = socialPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.content.toLowerCase().includes(query.toLowerCase())
      );
      setResults(fakeResults);
    };
    return (
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex mb-6">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            className="flex-1 px-4 py-3 border rounded-l-lg rounded-r-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="예: '면접' 또는 '가을 코디'" 
          />
          <button type="submit" className={textSearchButtonClass}>텍스트 검색</button>
        </form>
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg" onClick={() => { setSelectedPostId(post.id); setSocialPage('detail'); }}>
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full mb-2">{post.category}</span>
                <h3 className="font-semibold text-gray-800">{post.title}</h3>
                <p className="text-sm text-gray-600 truncate">{post.content}</p>
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
            <button onClick={() => setSocialPage('list')} className={`font-semibold text-lg ${socialPage === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>커뮤니티 홈</button>
            <button onClick={() => setSocialPage('search')} className={`font-semibold text-lg ${socialPage === 'search' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>텍스트 검색</button>
          </div>
          {/* ★ 4. 버튼 스타일 적용 */}
          <button onClick={() => setSocialPage('upload')} className={buttonClass}>
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
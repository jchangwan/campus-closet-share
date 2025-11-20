// src/pages/ClosetFeedSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartIcon } from '../components/Icons';
import { mockUser, mockClosetItemComments } from '../data/mockData';

// ★ 그라데이션 버튼 스타일
const buttonClass = "w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const textSearchButtonClass = "w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const aiButtonClass = "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50";


// 1. App.jsx로부터 props 받기
export default function ClosetFeedSection({ closetItems, onToggleBookmark, initialItemId, onClearInitialItem }) {
  const [closetPage, setClosetPage] = useState('list'); 
  const [selectedItemId, setSelectedItemId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const ITEMS_PER_PAGE = 5; 

  // 2. MyPage에서 '새 옷 등록' 클릭 시 바로 등록 탭으로 이동
  useEffect(() => {
    if (location.state?.openUpload) {
      setClosetPage('upload');
    }
  }, [location.state]);

  // 3. MyPage에서 아이템 클릭 시 바로 상세 탭으로 이동
  useEffect(() => {
      if (initialItemId) {
          setSelectedItemId(initialItemId);
          setClosetPage('detail');
          onClearInitialItem(); // App.jsx의 상태 초기화
      }
  }, [initialItemId, onClearInitialItem]);
  
  // --- (Part 4-1) 옷장 피드 메인 ---
  function ClosetFeedPage() {
    const [displayedItems, setDisplayedItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
      const initialItems = closetItems.slice(0, ITEMS_PER_PAGE);
      setDisplayedItems(initialItems);
      setHasMore(closetItems.length > ITEMS_PER_PAGE);
    }, [closetItems]); 

    const handleLoadMore = () => {
      const nextPage = page + 1;
      const newItems = closetItems.slice(0, nextPage * ITEMS_PER_PAGE);
      setDisplayedItems(newItems);
      setPage(nextPage);
      setHasMore(closetItems.length > newItems.length);
    };

    const ClosetItemCard = ({ item }) => (
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 flex items-center space-x-3"><img src={item.profilePic} alt={item.author} className="w-10 h-10 rounded-full" /><div><p className="font-semibold text-gray-800">{item.author}</p><p className="text-sm text-gray-500">{item.university}</p></div></div>
        <div className="relative">
          {item.status === 'rented' && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여중</span>
          )}
          <img src={item.imageUrl} alt={item.title} className="w-full h-72 object-cover cursor-pointer" onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }} />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">{item.title}</h3>
            <button onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }} className="p-1 -mt-1 -mr-1">
              <HeartIcon filled={item.isBookmarked} />
            </button>
          </div>
          <p className="text-indigo-600 font-semibold my-1">{item.pricePerDay.toLocaleString()}원 / 일</p>
          <p className="text-gray-700 text-sm truncate">{item.description}</p>
          <button onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2">더보기...</button>
        </div>
      </div>
    );

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {displayedItems.map(item => <ClosetItemCard key={item.id} item={item} />)}
        {hasMore && (<button onClick={handleLoadMore} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300">더보기</button>)}
      </div>
    );
  }
  
  // --- (Part 4-2) 옷 상세 페이지 ---
  function ItemDetailPage() {
    const item = closetItems.find(i => i.id === selectedItemId); 
    const [comments, setComments] = useState(mockClosetItemComments[selectedItemId] || []);
    const [newComment, setNewComment] = useState('');
    
    if (!item) return <p>아이템을 찾을 수 없습니다.</p>;
    
    // 4. navigateToMessages 대신 navigate 훅 사용
    const handleSendMessageClick = () => { 
      navigate('/messages', { 
        state: { 
          targetInfo: { itemId: item.id, itemTitle: item.title, itemImageUrl: item.imageUrl, authorName: item.author }
        } 
      }); 
    };
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if(!newComment.trim()) return;
        const commentToAdd = { id: Date.now(), author: mockUser.name, text: newComment };
        setComments([...comments, commentToAdd]);
        setNewComment('');
    };
    
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        <button onClick={() => setClosetPage('list')} className="text-indigo-600 p-4 hover:underline">&larr; 피드로 돌아가기</button>
        <img src={item.imageUrl} alt={item.title} className="w-full h-96 object-cover" />
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{item.title}</h2>
              <div className="flex items-center space-x-2 my-2"><img src={item.profilePic} alt={item.author} className="w-8 h-8 rounded-full" /><div><p className="font-semibold">{item.author}</p><p className="text-sm text-gray-500">{item.university}</p></div></div>
            </div>
            <div className="flex items-center space-x-4">
               <p className="text-2xl text-indigo-600 font-bold flex-shrink-0">{item.pricePerDay.toLocaleString()}원 / 일</p>
               <button onClick={() => onToggleBookmark(item.id)}>
                 <HeartIcon filled={item.isBookmarked} className="w-8 h-8" />
               </button>
            </div>
          </div>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">{item.description}</p>
          {/* ★ 5. 버튼 스타일 적용 */}
          <button onClick={handleSendMessageClick} className={`${aiButtonClass} mt-6`} disabled={item.status === 'rented'}>
            {item.status === 'rented' ? '현재 대여중입니다' : '대여 신청하기 (쪽지)'}
          </button>
        </div>
        {/* 댓글 섹션 */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4">상품 문의 ({comments.length})</h4>
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

  // --- (Part 4-3) 옷 등록 페이지 ---
  function UploadClosetItemPage() { 
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button onClick={() => setClosetPage('list')} className="text-indigo-600 mb-4 hover:underline">&larr; 피드로 돌아가기</button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">내 옷 등록하기</h2>
        <form className="space-y-6">
          {/* (폼 내용 생략) */}
          <div><label className="block text-gray-700 text-sm font-bold mb-2">옷 이름</label><input type="text" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="예: 봄 트렌치 코트 (M)" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">사진 등록</label><input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">1일 대여 가격 (원)</label><input type="number" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="예: 5000" /></div>
          <div><label className="block text-gray-700 text-sm font-bold mb-2">상세 설명</label><textarea className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4" placeholder="예: 브랜드, 사이즈, 옷 상태, 구매 시기 등"></textarea></div>
          {/* ★ 6. 버튼 스타일 적용 */}
          <button type="submit" className={aiButtonClass}>
            등록하기
          </button>
        </form>
      </div>
    );
  }
  
  // --- (Part 4-4) 텍스트 검색 페이지 ---
  function ClosetTextSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const handleSearch = (e) => {
      e.preventDefault();
      const fakeResults = closetItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase())
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
            placeholder="예: '트렌치 코트'" 
          />
          <button type="submit" className={textSearchButtonClass}>텍스트 검색</button>
        </form>
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map(item => (
              <div key={item.id} className="flex bg-white p-4 rounded-lg shadow-md items-center cursor-pointer hover:shadow-lg" onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }}>
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-lg object-cover mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.pricePerDay.toLocaleString()}원 / 일</p>
                  <p className="text-xs text-gray-500">{item.author} ({item.university})</p>
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
  
  // --- (Part 4-5) AI 검색 페이지 ---
  function ClosetAiSearchPage() {
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) { setPreview(URL.createObjectURL(file)); }
    };
    
    const handleAiSearch = (e) => {
      e.preventDefault();
      if (!fileInputRef.current?.files?.[0]) { alert("유사한 옷을 찾을 사진을 업로드해주세요."); return; }
      setIsSearching(true);
      setTimeout(() => {
          setResults([closetItems[1], closetItems[4], closetItems[6]]); 
          setIsSearching(false);
      }, 1500);
    };
    
    return (
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleAiSearch} className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">AI 유사 의류 검색</h3>
          <p className="text-sm text-gray-600 mb-4">가지고 있는 옷 사진을 업로드하면, 플랫폼 내에서 비슷한 스타일의 옷을 찾아줍니다.</p>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-4" />
          {preview && (<img src={preview} alt="업로드 미리보기" className="w-32 h-32 object-cover mx-auto rounded-lg mb-4" />)}
          {/* ★ 8. 버튼 스타일 적용 */}
          <button type="submit" className={aiButtonClass} disabled={isSearching}>
            {isSearching ? '비슷한 옷 찾는 중...' : 'AI로 찾기'}
          </button>
        </form>
        
        <h4 className="text-lg font-semibold mb-4">검색 결과:</h4>
        <div className="space-y-4">
          {isSearching && <p className="text-gray-500 text-center">검색 중...</p>}
          {results.length > 0 ? (
            results.map(item => (
              <div key={item.id} className="flex bg-white p-4 rounded-lg shadow-md items-center cursor-pointer hover:shadow-lg" onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }}>
                <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-lg object-cover mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.pricePerDay.toLocaleString()}원 / 일</p>
                  <p className="text-xs text-gray-500">{item.author} ({item.university})</p>
                </div>
              </div>
            ))
          ) : (
            !isSearching && <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    );
  }
  
  // --- (Part 4) 옷장 피드 섹션 메인 렌더링 ---
  return (
   <div className="w-full flex flex-col">
      <nav className="w-full bg-white shadow-md mb-8 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="space-x-6">
            <button onClick={() => setClosetPage('list')} className={`font-semibold text-lg ${closetPage === 'list' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>피드</button>
            <button onClick={() => setClosetPage('text-search')} className={`font-semibold text-lg ${closetPage === 'text-search' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>텍스트 검색</button>
            <button onClick={() => setClosetPage('ai-search')} className={`font-semibold text-lg ${closetPage === 'ai-search' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}>AI 검색</button>
          </div>
          {/* ★ 9. 버튼 스타일 적용 */}
          <button onClick={() => setClosetPage('upload')} className={buttonClass}>
            + 내 옷 등록
          </button>
        </div>
      </nav>
      <main className="container mx-auto px-4 sm:px-6 pb-8 flex-grow">
        {closetPage === 'list' && <ClosetFeedPage />}
        {closetPage === 'detail' && <ItemDetailPage />}
        {closetPage === 'upload' && <UploadClosetItemPage />}
        {closetPage === 'text-search' && <ClosetTextSearchPage />}
        {closetPage === 'ai-search' && <ClosetAiSearchPage />}
      </main>
    </div>
  );
}
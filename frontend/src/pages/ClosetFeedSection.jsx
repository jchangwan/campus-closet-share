// src/pages/ClosetFeedSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartIcon } from '../components/Icons';
import { listPosts, getPost, createPostWithImages, updatePost, deletePost } from '../api/posts';
import { createComment } from '../api/comments';

// ★ 그라데이션 버튼 스타일
const buttonClass = "w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const textSearchButtonClass = "w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const aiButtonClass = "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50";


// 1. 실제 API로부터 데이터를 불러오는 피드 섹션
export default function ClosetFeedSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const ITEMS_PER_PAGE = 5;
  const [closetItems, setClosetItems] = useState([]);
  const [feedPage, setFeedPage] = useState(0);
  const [feedLast, setFeedLast] = useState(false);

  // 초기 피드 로드
  useEffect(() => {
    async function loadInitial() {
      try {
        const data = await listPosts({ page: 0, size: 20, sort: 'createdAt,desc' });
        setClosetItems(data.content || []);
        setFeedPage(data.page || 0);
        setFeedLast(!!data.last);
      } catch (e) {
        console.error('Failed to load feed', e);
      }
    }
    loadInitial();
  }, []);

  

  // ★★★ 1. 페이지 모드 결정 (초기값 설정 통합) ★★★
  // 들어올 때부터 "글쓰기"인지 "상세보기"인지 "목록"인지 딱 정하고 시작합니다.
  const [closetPage, setClosetPage] = useState(() => {
    if (location.state?.itemId) return 'detail';      // 1. 아이템 ID가 있으면 -> 상세 페이지
    if (location.state?.openUpload) return 'upload';  // 2. 업로드 요청이 있으면 -> 글쓰기 페이지
    return 'list';                                    // 3. 아무것도 없으면 -> 목록
  });
  
  // ★★★ 2. 선택된 아이템 ID 설정 ★★★
  const [selectedItemId, setSelectedItemId] = useState(() => 
    location.state?.itemId || null
  );

  // ★★★ 3. useEffect는 이제 보조 역할만 합니다 ★★★
  // 이미 들어와 있는 상태에서 URL state가 바뀌었을 때를 대비해 남겨둡니다.
  useEffect(() => {
    if (location.state?.itemId) {
      setSelectedItemId(location.state.itemId);
      setClosetPage('detail');
    } else if (location.state?.openUpload) {
      setClosetPage('upload');
    }
  }, [location.state]);
  
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setClosetItems(prev => prev.map(it => it.id === item.id ? { ...it, isBookmarked: !it.isBookmarked } : it));
              }}
              className="p-1 -mt-1 -mr-1">
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
  
  // --- (Part 4-2) 옷 상세 페이지 (수정본: 메뉴 + 상태변경 모달 추가) ---
function ItemDetailPage() {
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!selectedItemId) return;
    (async () => {
      try {
        const data = await getPost(selectedItemId);
        if (data.post) {
          setItem(data.post);
          setComments(data.comments || []);
        } else {
          // fallback 형식
          setItem(data);
          setComments(data.comments || []);
        }
      } catch (e) {
        console.error('failed to load post detail', e);
      }
    })();
  }, [selectedItemId]);
    
    // ★ 1. 메뉴와 모달을 위한 새로운 State들
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tempStatus, setTempStatus] = useState(item?.status || 'available');
    const [tempReturnDate, setTempReturnDate] = useState(item?.returnDate || '');

    if (!item) return <p>아이템을 찾을 수 없습니다.</p>;

    // ★ 2. 내 옷인지 확인 (작성자 이름으로 비교)
    //const isMyItem = mockUser.name === item.author;
    //테스트를 위해 무조건 true로 설정!
    const isMyItem = true;
    
    // 쪽지 보내기 핸들러 (기존 유지)
    const handleSendMessageClick = () => { 
      navigate('/messages', { 
        state: { 
          targetInfo: { itemId: item.id, itemTitle: item.title, itemImageUrl: item.imageUrl, authorName: item.author }
        } 
      }); 
    };
    
    // 댓글 등록 핸들러 (기존 유지)
const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if(!newComment.trim() || !item) return;
    try {
      const saved = await createComment(item.id, newComment.trim());
      setComments(prev => [...prev, saved]);
      setNewComment('');
    } catch (err) {
      console.error('failed to create comment', err);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
        setNewComment('');
    };

    // ★ 3. 상태 변경 저장 핸들러 (수정됨: 부모에게 알리기)
    const handleSaveStatus = () => {
// 1. 서버에 상태 업데이트 요청
(async () => {
  try {
    const serverStatus = tempStatus === 'available' ? 'AVAILABLE' : 'RENTED';
    const updated = await updatePost(item.id, { rentalStatus: serverStatus });
    // 로컬 리스트에도 반영
    setClosetItems(prev => prev.map(it => it.id === item.id ? { ...it, rentalStatus: updated.rentalStatus } : it));
    alert(`상태가 변경되었습니다! [${tempStatus === 'available' ? '대여 가능' : '대여중'}]`);
  } catch (e) {
    console.error('failed to update status', e);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
})();

// 2. 모달 닫기
      setIsStatusModalOpen(false);
      setIsMenuOpen(false);
    };
    
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden relative">
        
        {/* ★ 4. 상단 네비게이션 바 (뒤로가기 + 점 3개 메뉴) */}
        <div className="flex justify-between items-center p-4 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-10">
          <button onClick={() => setClosetPage('list')} className="text-white font-bold hover:underline drop-shadow-md">&larr; 피드로 돌아가기</button>
          
          {/* 내 옷일 때만 메뉴 버튼 보이기 */}
          {isMyItem && (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white font-bold text-2xl focus:outline-none drop-shadow-md px-2"
              >
                ⋮
              </button>
              
              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-20">
                  <button 
                    onClick={() => { setIsStatusModalOpen(true); setTempStatus(item.status); }}
                    className="block w-full text-left px-4 py-3 text-sm text-indigo-600 font-bold hover:bg-gray-50"
                  >
                    🔄 상태 변경하기
                  </button>
                  <div className="border-t my-1"></div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingItem(item); setClosetPage('upload'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ✎ 게시글 수정
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    🗑️ 삭제하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 이미지 영역 (대여중 배지 추가) */}
        <div className="relative">
          <img src={item.imageUrl} alt={item.title} className="w-full h-96 object-cover" />
          {item.status === 'rented' && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
              🔴 대여중 {item.returnDate && `(~${item.returnDate})`}
            </div>
          )}
        </div>

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
          
          <button onClick={handleSendMessageClick} className={`${aiButtonClass} mt-6`} disabled={item.status === 'rented'}>
            {item.status === 'rented' ? '현재 대여중입니다' : '대여 신청하기 (쪽지)'}
          </button>
        </div>

        {/* ★ 5. 상태 변경 모달 (팝업창) */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
              <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">대여 상태 변경</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTempStatus('available')}
                    className={`py-3 rounded-lg font-bold border-2 transition-all ${tempStatus === 'available' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    🟢 대여 가능
                  </button>
                  <button 
                    onClick={() => setTempStatus('rented')}
                    className={`py-3 rounded-lg font-bold border-2 transition-all ${tempStatus === 'rented' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    🔴 대여중
                  </button>
                </div>
                {tempStatus === 'rented' && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">반납 예정일</label>
                    <input 
                      type="date" 
                      value={tempReturnDate}
                      onChange={(e) => setTempReturnDate(e.target.value)}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-gray-700"
                    />
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex space-x-3">
                <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">취소</button>
                <button onClick={handleSaveStatus} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition">확인 (저장)</button>
              </div>
            </div>
          </div>
        )}

        {/* 댓글 섹션 (기존 유지) */}
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
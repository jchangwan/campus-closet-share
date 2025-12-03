// src/pages/ClosetFeedSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeartIcon } from '../components/Icons';
import { listPosts, getPost, createPost, updatePost, deletePost } from '../api/posts'; // createPostWithImages -> createPost 변경
import { createComment } from '../api/comments';
import { uploadImages } from '../api/files'; // ★ 파일 업로드 API 추가

// ★ 그라데이션 버튼 스타일 (기존 디자인 유지)
const buttonClass = "w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const textSearchButtonClass = "w-auto rounded-l-none !py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-r-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";
const aiButtonClass = "w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50";

const CATEGORIES = ['TOP', 'BOTTOM', 'OUTER', 'SHOES', 'ACC'];

// 1. 실제 API로부터 데이터를 불러오는 피드 섹션
export default function ClosetFeedSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const ITEMS_PER_PAGE = 5;
  const [closetItems, setClosetItems] = useState([]);
  
  // 페이지 모드 결정
  const [closetPage, setClosetPage] = useState(() => {
    if (location.state?.itemId) return 'detail';
    if (location.state?.openUpload) return 'upload';
    return 'list';
  });
  
  const [selectedItemId, setSelectedItemId] = useState(() => 
    location.state?.itemId || null
  );
  
  // 수정 모드용 상태
  const [editingItem, setEditingItem] = useState(null);

  // 초기 피드 로드
  const loadFeed = async () => {
    try {
      const data = await listPosts({ page: 0, size: 20, sort: 'createdAt,desc' });
      // 백엔드 스펙상 배열이 올 수도 있고 Page 객체가 올 수도 있음. 배열로 처리.
      const items = Array.isArray(data) ? data : (data.content || []);
      setClosetItems(items);
    } catch (e) {
      console.error('Failed to load feed', e);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (location.state?.itemId) {
      setSelectedItemId(location.state.itemId);
      setClosetPage('detail');
    } else if (location.state?.openUpload) {
      setClosetPage('upload');
      setEditingItem(null);
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

    const ClosetItemCard = ({ item }) => {
      // 스펙 필드 매핑
      const authorName = item.ownerId ? `User ${item.ownerId}` : '익명';
      const status = item.rentalStatus === 'RENTED' ? 'rented' : 'available';
      
      return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">U</div>
            <div>
              <p className="font-semibold text-gray-800">{authorName}</p>
              {/* university 정보가 스펙에 없으므로 생략하거나 ownerId로 조회 필요 */}
            </div>
          </div>
          <div className="relative">
            {status === 'rented' && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여중</span>
            )}
            <img 
              src={item.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'} 
              alt={item.title} 
              className="w-full h-72 object-cover cursor-pointer" 
              onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }} 
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full mb-1 mr-1">{item.category}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mb-1">{item.size}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{item.title}</h3>
              </div>
              <button
                className="p-1 -mt-1 -mr-1">
                <HeartIcon filled={false} />
              </button>
            </div>
            {/* 가격 필드가 스펙에서 삭제됨 -> 설명만 표시 */}
            <p className="text-gray-700 text-sm truncate mt-2">{item.description}</p>
            <button onClick={() => { setSelectedItemId(item.id); setClosetPage('detail'); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2">더보기...</button>
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {closetItems.length === 0 ? <p className="text-center py-10 text-gray-500">등록된 옷이 없습니다.</p> : null}
        {displayedItems.map(item => <ClosetItemCard key={item.id} item={item} />)}
        {hasMore && (<button onClick={handleLoadMore} className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300">더보기</button>)}
      </div>
    );
  }
  
  // --- (Part 4-2) 옷 상세 페이지 ---
  function ItemDetailPage() {
    const [item, setItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [tempStatus, setTempStatus] = useState('AVAILABLE'); // 대문자로 관리

    useEffect(() => {
      if (!selectedItemId) return;
      (async () => {
        try {
          const data = await getPost(selectedItemId);
          setItem(data); 
          // comments는 API 응답 구조에 따라 data.comments 일수도 있음. 
          // 일단 상세 조회 응답에 comments가 없으면 별도 호출 필요할 수 있음. 
          // 스펙 2-3-2에는 comments 필드 언급이 없으나 기존 코드를 위해 빈 배열 처리
          setComments([]); 
          setTempStatus(data.rentalStatus || 'AVAILABLE');
        } catch (e) {
          console.error('failed to load post detail', e);
        }
      })();
    }, [selectedItemId]);
    
    if (!item) return <p className="text-center py-10">로딩 중...</p>;

    const isMyItem = true; // 임시: 내 옷 여부 (실제로는 ownerId와 내 ID 비교)
    
    // ★ [수정됨] 쪽지 보내기 핸들러 (receiverId에 ownerId 할당)
    const handleSendMessageClick = () => { 
      navigate('/messages', { 
        state: { 
          targetInfo: { 
            itemId: item.id, 
            itemTitle: item.title, 
            itemImageUrl: item.imageUrl, 
            receiverId: item.ownerId // ★ 중요: 받는 사람 ID
          }
        } 
      }); 
    };
    
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
    };

    // 상태 변경 저장 핸들러
    const handleSaveStatus = () => {
      (async () => {
        try {
          const updated = await updatePost(item.id, { rentalStatus: tempStatus });
          setItem(prev => ({ ...prev, rentalStatus: updated.rentalStatus }));
          setClosetItems(prev => prev.map(it => it.id === item.id ? { ...it, rentalStatus: updated.rentalStatus } : it));
          alert(`상태가 변경되었습니다!`);
        } catch (e) {
          console.error('failed to update status', e);
          alert('상태 변경 실패');
        }
      })();
      setIsStatusModalOpen(false);
      setIsMenuOpen(false);
    };

    const handleDeleteClick = async () => {
      if (!window.confirm("정말로 삭제하시겠습니까?")) return;
      try {
        await deletePost(item.id);
        alert("삭제되었습니다.");
        setClosetPage('list');
        loadFeed(); 
      } catch (e) {
        alert("삭제 실패");
      }
    };
    
    const authorName = item.ownerId ? `User ${item.ownerId}` : '익명';
    const isRented = item.rentalStatus === 'RENTED';

    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden relative">
        
        {/* 상단 네비게이션 */}
        <div className="flex justify-between items-center p-4 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-10">
          <button onClick={() => setClosetPage('list')} className="text-white font-bold hover:underline drop-shadow-md">&larr; 피드로 돌아가기</button>
          
          {isMyItem && (
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white font-bold text-2xl focus:outline-none drop-shadow-md px-2">⋮</button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-20">
                  <button onClick={() => { setIsStatusModalOpen(true); setTempStatus(item.rentalStatus || 'AVAILABLE'); }} className="block w-full text-left px-4 py-3 text-sm text-indigo-600 font-bold hover:bg-gray-50">🔄 상태 변경하기</button>
                  <div className="border-t my-1"></div>
                  <button onClick={() => { setEditingItem(item); setClosetPage('upload'); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">✎ 게시글 수정</button>
                  <button onClick={handleDeleteClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">🗑️ 삭제하기</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 이미지 영역 */}
        <div className="relative">
          <img src={item.imageUrl || 'https://via.placeholder.com/600x600'} alt={item.title} className="w-full h-96 object-cover" />
          {isRented && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
              🔴 대여중
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{item.title}</h2>
              <div className="flex items-center space-x-2 my-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div><p className="font-semibold">{authorName}</p></div>
              </div>
              <div className="mt-2 space-x-2">
                 <span className="bg-gray-100 px-2 py-1 rounded text-sm">{item.category}</span>
                 <span className="bg-gray-100 px-2 py-1 rounded text-sm">{item.size}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               {/* 가격 정보 없음 */}
               <HeartIcon filled={false} className="w-8 h-8" />
            </div>
          </div>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap">{item.description}</p>
          
          <button onClick={handleSendMessageClick} className={`${aiButtonClass} mt-6`} disabled={isRented}>
            {isRented ? '현재 대여중입니다' : '대여 신청하기 (쪽지)'}
          </button>
        </div>

        {/* 상태 변경 모달 */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">대여 상태 변경</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTempStatus('AVAILABLE')}
                    className={`py-3 rounded-lg font-bold border-2 transition-all ${tempStatus === 'AVAILABLE' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    🟢 대여 가능
                  </button>
                  <button 
                    onClick={() => setTempStatus('RENTED')}
                    className={`py-3 rounded-lg font-bold border-2 transition-all ${tempStatus === 'RENTED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                  >
                    🔴 대여중
                  </button>
                </div>
              </div>
              <div className="p-4 border-t flex space-x-3">
                <button onClick={() => setIsStatusModalOpen(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">취소</button>
                <button onClick={handleSaveStatus} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition">확인 (저장)</button>
              </div>
            </div>
          </div>
        )}

        {/* 댓글 섹션 */}
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4">상품 문의 ({comments.length})</h4>
          <div className="space-y-4 mb-4">
            {comments.map((comment, idx) => (<div key={comment.id || idx}><p className="font-semibold text-sm">User</p><p className="text-gray-700">{comment.content}</p></div>))}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="문의 내용을 입력하세요..." className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-gray-700 text-white px-5 py-3 rounded-lg hover:bg-gray-800 font-semibold transition">등록</button>
          </form>
        </div>
      </div>
    );
  }
  

  // --- (Part 4-3) 옷 등록 페이지 (스펙 적용) ---
  function UploadClosetItemPage() { 
    // 기존 입력 필드(가격) 삭제, 새 필드(카테고리, 사이즈) 추가
    const [title, setTitle] = useState(editingItem?.title || '');
    const [description, setDescription] = useState(editingItem?.description || '');
    const [category, setCategory] = useState(editingItem?.category || 'TOP');
    const [size, setSize] = useState(editingItem?.size || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(editingItem?.imageUrl || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        let finalImageUrl = editingItem?.imageUrl || "";

        // 1. 이미지 업로드 (2단계)
        if (selectedFile) {
          const uploadRes = await uploadImages([selectedFile]);
          if (uploadRes.urls && uploadRes.urls.length > 0) {
            finalImageUrl = uploadRes.urls[0];
          }
        }

        // 2. 글 작성 (스펙 2-3-3: title, description, imageUrl, category, size)
        const payload = {
          title,
          description,
          imageUrl: finalImageUrl,
          category,
          size
        };

        if (editingItem) {
          await updatePost(editingItem.id, payload);
          alert('수정되었습니다!');
        } else {
          await createPost(payload);
          alert('등록되었습니다!');
        }

        loadFeed();
        setClosetPage('list');
        setEditingItem(null);
      } catch (err) {
        console.error(err);
        alert('저장 실패');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-2xl">
        <button onClick={() => { setClosetPage('list'); setEditingItem(null); }} className="text-indigo-600 mb-4 hover:underline">&larr; 피드로 돌아가기</button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{editingItem ? '옷 정보 수정' : '내 옷 등록하기'}</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">옷 이름</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="예: 봄 트렌치 코트 (M)" />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">사진 등록</label>
            <input type="file" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {preview && <img src={preview} alt="preview" className="mt-2 h-40 object-cover rounded border" />}
          </div>

          {/* ★ 스펙 변경: 가격 삭제 -> 카테고리/사이즈 추가 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">카테고리</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">사이즈</label>
              <input type="text" value={size} onChange={(e) => setSize(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="예: M, 100" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">상세 설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4" placeholder="브랜드, 옷 상태, 구매 시기 등 (가격 정보도 여기에 적어주세요)"></textarea>
          </div>
          
          <button type="submit" className={aiButtonClass} disabled={isLoading}>
            {isLoading ? '저장 중...' : (editingItem ? '수정하기' : '등록하기')}
          </button>
        </form>
      </div>
    );
  }
  
  // --- (Part 4-4) 텍스트 검색 페이지 (API 미연동 - UI 유지) ---
  function ClosetTextSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    
    // 단순 클라이언트 필터링 예시 (실제론 API 호출 필요)
    const handleSearch = (e) => {
      e.preventDefault();
      const fakeResults = closetItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description?.toLowerCase().includes(query.toLowerCase())
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
                  <p className="text-sm text-gray-600">{item.description}</p>
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
  
  // --- (Part 4-5) AI 검색 페이지 (Mock 유지) ---
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
          setResults(closetItems.slice(0, 3)); 
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
                  <p className="text-sm text-gray-600">{item.description}</p>
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
          <button onClick={() => { setClosetPage('upload'); setEditingItem(null); }} className={buttonClass}>
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
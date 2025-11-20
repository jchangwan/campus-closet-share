import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from '../components/ProfileEditModal';

// ★ 1. 대여 등록 모달 (컴포넌트 정의)
const RentalRegistrationModal = ({ isOpen, onClose, availableItems, onRent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [returnDate, setReturnDate] = useState('');

  if (!isOpen) return null;

  // 검색어에 따라 목록 필터링
  const filteredItems = availableItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedId || !returnDate) {
      alert("옷과 반납일을 모두 선택해주세요.");
      return;
    }
    onRent(parseInt(selectedId), returnDate);
    onClose();
    setSearchTerm('');
    setSelectedId('');
    setReturnDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* 모달 헤더 */}
        <div className="bg-gray-900 p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">대여 내역 등록</h3>
            <p className="text-xs text-gray-400 mt-1">친구의 옷을 빌렸다면 여기서 기록하세요.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        
        {/* 모달 내용 (스크롤 가능) */}
        <div className="p-6 overflow-y-auto">
          
          {/* 1. 검색창 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">어떤 옷을 빌리셨나요?</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">🔍</span>
              <input 
                type="text" 
                placeholder="옷 이름 또는 친구 이름 검색..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 2. 검색 결과 리스트 (드롭다운 대신 리스트 형태) */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-2">목록에서 선택해주세요 ({filteredItems.length}개)</p>
            <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto bg-white custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedId(item.id)}
                    className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors flex items-center space-x-3
                      ${selectedId === item.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-gray-50 border-l-4 border-transparent'}
                    `}
                  >
                    <img src={item.imageUrl} alt="" className="w-12 h-12 rounded bg-gray-200 object-cover border" />
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${selectedId === item.id ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.author} · {item.pricePerDay.toLocaleString()}원</p>
                    </div>
                    {selectedId === item.id && <span className="text-indigo-600 font-bold text-lg">✓</span>}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. 반납일 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">언제 반납하실 건가요?</label>
            <input 
              type="date" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors">취소</button>
          <button 
            onClick={handleSubmit} 
            className={`px-5 py-2.5 rounded-lg font-bold text-white shadow-md transition-all
              ${selectedId && returnDate ? 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}
            `}
            disabled={!selectedId || !returnDate}
          >
            등록완료
          </button>
        </div>
      </div>
    </div>
  );
};

// ★ 2. Main Component (onRentItem props 추가됨)
export default function MyPage({ currentUser, onUpdateProfile, allClosetItems, allSocialPosts, handleViewMyItem, onRentItem }) {
  const navigate = useNavigate();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // ★ 3. 대여 등록 모달 상태 추가
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  // ★ 4. "새 옷 등록하기"와 "대여 내역 추가"에 공통으로 쓸 스타일 (회색 점선)
  const addCardStyle = "flex flex-col items-center justify-center w-full h-full min-h-[150px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-600 transition cursor-pointer";

  // --- Section 컴포넌트 ---
  const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
  
  // --- ItemCard 컴포넌트 ---
  const ItemCard = ({ item, showReturnDate = false, onClick }) => {
    const getStatusBadge = () => {
      if (item.status === 'rented') {
        return <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여중</span>;
      } 
      return <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여 가능</span>;
    };

    return (
      <div 
        className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative bg-white ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick} 
      >
        {getStatusBadge()}
        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
        <div className="p-3">
          <p className="font-semibold text-gray-700 text-sm truncate">{item.title}</p>
          {item.status === 'rented' && item.returnDate && (
             <p className="text-xs text-red-600 font-bold mt-1">반납일: {item.returnDate}</p>
          )}
        </div>
      </div>
    );
  };
  
  // --- SocialPostListCard 컴포넌트 ---
  const SocialPostListCard = ({ post }) => (
      <div 
          onClick={() => navigate('/social', { state: { postId: post.id } })}
          className="flex bg-white p-3 rounded-lg shadow-sm items-center cursor-pointer hover:shadow-lg"
      >
          {post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className="w-16 h-16 rounded-lg object-cover mr-4" />
          ) : (
              <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 text-xs text-center font-bold">{post.category}</span>
              </div>
          )}
          <div className="flex-1 overflow-hidden">
              <span className="text-xs text-purple-700 font-semibold">{post.category}</span>
              <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
              <p className="text-sm text-gray-500 truncate">{post.author} · {post.createdAt}</p>
          </div>
      </div>
  );
  
  // ★ 5. 데이터 필터링 로직 수정 (mockData 제거하고 실제 로직 적용)
  
  // (1) 내가 등록한 옷
  const myCloset = allClosetItems.filter(item => item.isMine);
  
  // (2) 내가 대여한 옷 (상태가 rented이고, 빌린 사람이 나인 경우)
  const rentedItems = allClosetItems.filter(item => 
    item.status === 'rented' && item.rentedBy === currentUser.email
  );
  const rentedItemIds = rentedItems.map(item => item.id);

  // (3) 찜한 옷
  const bookmarkedItems = allClosetItems.filter(item => 
    item.isBookmarked && !item.isMine && !rentedItemIds.includes(item.id)
  );

  const savedPosts = allSocialPosts.filter(post => post.isSaved);

  // (4) 대여 등록 모달에 보여줄 목록 (내 옷 아니고, 대여 가능한 것)
  const availableForRentItems = allClosetItems.filter(item => 
    !item.isMine && item.status !== 'rented'
  );
  
  // 버튼 스타일 (프로필 수정 등 작은 버튼용)
  const secondaryButtonClass = "bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-1 px-3 rounded-lg text-sm transition-colors duration-200";

  return (
    <div className="max-w-4xl mx-auto">
      {/* 프로필 섹션 */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6 flex items-center">
        <img src={currentUser.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full mr-6 border-2 border-gray-200 object-cover" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{currentUser.name || currentUser.email}</h2>
          <p className="text-gray-600">{currentUser.university} (인증 완료)</p>
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className={`mt-2 ${secondaryButtonClass}`}
          >
            프로필 수정
          </button>
          <button 
            onClick={() => navigate('/messages')} 
            className={`mt-2 ml-4 ${secondaryButtonClass}`}
          >
            쪽지함 가기
          </button>
        </div>
      </div>
      
      {/* 내가 등록한 옷 (My Closet) */}
      <Section title="내가 등록한 옷 (My Closet)">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {myCloset.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => navigate('/feed', { state: { itemId: item.id } })} 
            />
          ))}
          {/* 기존의 새 옷 등록 버튼 (스타일 변수 적용) */}
          <button 
            onClick={() => navigate('/feed', { state: { openUpload: true } })} 
            className={addCardStyle}
          > 
            <span className="text-2xl font-light mb-1">+</span>
            <span className="text-sm">새 옷 등록하기</span>
          </button>
        </div>
      </Section>
      
      {/* 찜한 옷 */}
      <Section title="찜한 옷 (Bookmarked Items)">
        {bookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bookmarkedItems.map(item => (
              <ItemCard key={item.id} item={item} onClick={() => navigate('/feed', { state: { itemId: item.id } })} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">아직 찜한 옷이 없습니다.</p>
        )}
      </Section>
      
      {/* 저장한 글 */}
      <Section title="저장한 글 (Saved Posts)">
        {savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.map(post => (
              <SocialPostListCard key={post.id} post={post} onClick={() => navigate('/social', { state: { postId: post.id } })} 
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">아직 저장한 글이 없습니다.</p>
        )}
      </Section>

      {/* ★ 6. 내가 대여한 옷 (여기가 수정됨) */}
      <Section title="내가 대여한 옷 (Rented)">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* 대여 목록 */}
          {rentedItems.map(item => (
            <ItemCard key={item.id} item={item} showReturnDate={true} onClick={() => navigate('/feed', { state: { itemId: item.id } })} 
            />
          ))}
          
          {/* ★ 대여 내역 추가 버튼 (새 옷 등록과 동일한 디자인) */}
          <button 
            onClick={() => setIsRentalModalOpen(true)} 
            className={addCardStyle}
          > 
            <span className="text-2xl font-light mb-1">+</span>
            <span className="text-sm">대여 내역 추가</span>
          </button>
        </div>
      </Section>

      {/* 모달 렌더링 */}
      {isProfileModalOpen && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateProfile={onUpdateProfile}
        />
      )}

      {/* ★ 대여 등록 모달 연결 */}
      <RentalRegistrationModal 
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        availableItems={availableForRentItems}
        onRent={onRentItem}
      />
    </div>
  );
}
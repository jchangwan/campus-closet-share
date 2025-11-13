import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ★ 1. mockData 임포트 수정 (currentUser는 props로 받음)
import { 
  mockRentedItems 
} from '../data/mockData';

// ★ 2. ProfileEditModal 임포트 (다시 추가)
import ProfileEditModal from '../components/ProfileEditModal';


// ★ 3. 모든 props 받기
export default function MyPage({ currentUser, onUpdateProfile, allClosetItems, allSocialPosts, handleViewMyItem }) {
  const navigate = useNavigate();
  
  // ★ 4. 프로필 수정 모달 상태 (다시 추가)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- (Section, ItemCard, SocialPostListCard 컴포넌트 - 원본과 동일) ---
  const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
  
  const ItemCard = ({ item, showReturnDate = false, onClick }) => (
    <div 
      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick} 
    >
      {item.status === 'rented' ? (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여중</span>
      ) : (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">대여 가능</span>
      )}
      <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
      <div className="p-3">
        <p className="font-semibold text-gray-700 text-sm truncate">{item.title}</p>
        {showReturnDate && (<p className="text-xs text-red-500 mt-1">반납일: {item.returnDate}</p>)}
      </div>
    </div>
  );
  
  const SocialPostListCard = ({ post }) => (
      <div 
          onClick={() => alert(`'${post.title}' 상세 페이지로 이동 (커뮤니티 섹션으로 이동)`)}
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
  
  // ★ 5. props로 받은 데이터로 목록 필터링
  const myCloset = allClosetItems.filter(item => item.isMine);
  const rentedItems = mockRentedItems;
  const bookmarkedItems = allClosetItems.filter(item => item.isBookmarked && !item.isMine);
  const savedPosts = allSocialPosts.filter(post => post.isSaved);
  
  // ★ 6. 버튼 스타일 (회색 버튼)
  const secondaryButtonClass = "bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold py-1 px-3 rounded-lg text-sm transition-colors duration-200";

  return (
    <div className="max-w-4xl mx-auto">
      {/* ★ 7. 프로필 섹션 (currentUser 사용) */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6 flex items-center">
        <img src={currentUser.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full mr-6 border-2 border-gray-200 object-cover" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{currentUser.name || currentUser.email}</h2>
          <p className="text-gray-600">{currentUser.university} (인증 완료)</p>
          {/* ★ 8. '프로필 수정' 버튼 onClick 핸들러 (다시 추가) */}
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
            <ItemCard key={item.id} item={item} onClick={() => handleViewMyItem(item.id)} />
          ))}
          <button 
            onClick={() => navigate('/feed', { state: { openUpload: true } })} 
            className="flex items-center justify-center w-full h-full min-h-[150px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-600 transition"
          > 
            + 새 옷 등록하기 
          </button>
        </div>
      </Section>
      
      {/* 찜한 옷 (Bookmarked Items) */}
      <Section title="찜한 옷 (Bookmarked Items)">
        {bookmarkedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bookmarkedItems.map(item => (
              <ItemCard key={item.id} item={item} onClick={() => handleViewMyItem(item.id)} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">아직 찜한 옷이 없습니다.</p>
        )}
      </Section>
      
      {/* 저장한 글 (Saved Posts) */}
      <Section title="저장한 글 (Saved Posts)">
        {savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.map(post => (
              <SocialPostListCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">아직 저장한 글이 없습니다.</p>
        )}
      </Section>

      {/* 내가 대여한 옷 (Rented) */}
      <Section title="내가 대여한 옷 (Rented)">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {rentedItems.map(item => (
            <ItemCard key={item.id} item={item} showReturnDate={true} />
          ))}
        </div>
      </Section>

      {/* ★ 9. 프로필 수정 모달 렌더링 (다시 추가) */}
      {isProfileModalOpen && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateProfile={onUpdateProfile}
        />
      )}
    </div>
  );
}
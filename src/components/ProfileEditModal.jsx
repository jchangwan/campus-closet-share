import React, { useState } from 'react';

export default function ProfileEditModal({ isOpen, onClose, currentUser, onUpdateProfile }) {
  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 수정될 프로필 정보를 위한 로컬 상태
  const [editingProfile, setEditingProfile] = useState({
    name: currentUser.name || '',
    university: currentUser.university || '',
    profileImageUrl: currentUser.profileImageUrl || '' // 현재 프로필 이미지 URL
  });
  const [profileImageFile, setProfileImageFile] = useState(null); // 실제 업로드될 파일 객체

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file); // 실제 파일 객체 저장
      // 이미지 미리보기를 위해 URL 생성
      setEditingProfile(prev => ({ ...prev, profileImageUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 1. 실제 이미지 업로드 로직 (지금은 가짜 URL만 업데이트)
    // 실제 서버에 이미지를 업로드하고, 서버로부터 새 이미지 URL을 받아와야 합니다.
    // 여기서는 간단하게 미리보기 URL을 그대로 사용합니다.
    
    // 2. 부모 컴포넌트(App.jsx)의 프로필 업데이트 함수 호출
    onUpdateProfile(editingProfile);
    onClose(); // 모달 닫기
  };

  // 공통 버튼 스타일 클래스
  const buttonBaseClass = "font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200";
  // ★ '저장' 버튼 (그라데이션 적용)
  const primaryButtonClass = `${buttonBaseClass} bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg`;
  // '취소' 버튼 (회색 유지)
  const secondaryButtonClass = `${buttonBaseClass} bg-gray-200 text-gray-800 hover:bg-gray-300`;


  return (
    // 모달 배경 (클릭 시 닫히도록)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">프로필 수정</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 프로필 이미지 미리보기 및 업로드 */}
          <div className="flex flex-col items-center gap-4">
            <img
              src={editingProfile.profileImageUrl || 'https://placehold.co/100x100/E2E8F0/A0AEC0?text=Profile'}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-indigo-200"
            />
            <label htmlFor="profileImageInput" className={`${secondaryButtonClass} cursor-pointer`}>
              사진 변경
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* 이름 입력 필드 */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editingProfile.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 대학교 입력 필드 (현재는 수정 불가) */}
          <div>
            <label htmlFor="university" className="block text-gray-700 text-sm font-bold mb-2">대학교</label>
            <input
              type="text"
              id="university"
              name="university"
              value={editingProfile.university}
              // 대학교는 인증된 정보이므로 수정 불가하도록 readOnly 처리
              readOnly
              className="w-full px-4 py-2 border rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
              placeholder="경기대학교"
            />
            <p className="text-xs text-gray-500 mt-1">학교 정보는 인증 완료되어 수정할 수 없습니다.</p>
          </div>
          
          {/* 이메일 (현재는 수정 불가) */}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={currentUser.email} // currentUser에서 직접 가져와 표시
              readOnly
              className="w-full px-4 py-2 border rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
          </div>


          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={secondaryButtonClass}
            >
              취소
            </button>
            <button
              type="submit"
              className={primaryButtonClass}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
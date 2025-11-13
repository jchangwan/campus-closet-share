// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() { 
  const navigate = useNavigate();

  
  const buttonClass = "w-full max-w-xs mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300";

  return (
    <div className="text-center py-20 flex flex-col items-center justify-center min-h-[calc(100vh-250px)]"> {/* 중앙 정렬을 위해 min-h 추가 */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Campus Closet Share</h1>
      <p className="text-xl text-gray-600 mb-8">우리 학교 학생들과 안전하게 옷을 공유하고 대여해요.</p>
      
      <button onClick={() => navigate('/login')} className={buttonClass}>
        시작하기
      </button>
    </div>
  );
}
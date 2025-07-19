'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '../components/Container';
import { useChild } from '../contexts/ChildContext';
import { clearAuthState } from '../auth/index';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isChildMode, selectedChild, exitChildMode, enterChildMode } = useChild();
  const [fromPage, setFromPage] = useState('/home');

  const handleLogout = async () => {
    console.log('🔐 로그아웃 시작');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('📡 서버 로그아웃 응답:', response.status);
    } catch (error) {
      console.log('⚠️ 서버 로그아웃 실패 (클라이언트 로그아웃 계속 진행):', error);
    }
    
    // 클라이언트에서 직접 관련 정보 삭제
    console.log('🔐 클라이언트 로그아웃 시작');
    
    // 인증 관련 정보 삭제
    clearAuthState();
    
    // 자녀 관련 정보 삭제
    localStorage.removeItem('selectedChild');
    localStorage.removeItem('isChildMode');
    localStorage.removeItem('childRelations');
    
    // 예보 관련 임시 데이터 삭제
    localStorage.removeItem('forecastEmotions');
    localStorage.removeItem('forecastRecordEmotions');
    
    // 기타 관련 데이터 삭제
    localStorage.removeItem('diaryData');
    localStorage.removeItem('forecastData');
    
    // 일반 쿠키 삭제
    const deleteCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    };
    
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    
    console.log('✅ 로그아웃 완료 - 서버와 클라이언트 모든 데이터 삭제됨');
    
    // 홈페이지로 이동
    router.push('/');
  };

  const handleModeToggle = () => {
    if (isChildMode) {
      // 보호자 모드로 전환
      exitChildMode();
      router.push('/home');
    } else {
      // 아이 모드로 전환하려면 선택된 아이가 있어야 함
      if (selectedChild) {
        enterChildMode(selectedChild);
        router.push('/baby');
      } else {
        // 선택된 아이가 없으면 아이 목록으로 이동
        router.push('/childList');
      }
    }
  };

  // URL 쿼리 파라미터에서 원래 페이지 정보 가져오기
  useEffect(() => {
    const from = searchParams.get('from');
    if (from) {
      setFromPage(decodeURIComponent(from));
    }
  }, [searchParams]);

  const handleBackToHome = () => {
    router.push(fromPage);
  };

  return (
    <Container className="bg-white">
      <div className="flex flex-col items-start justify-start w-full max-w-sm mx-auto mt-4 pb-20">
        {/* 헤더 */}
        <div className="flex items-center justify-between w-full mb-6">
          <button
            onClick={handleBackToHome}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="뒤로 가기"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">설정</h1>
          <div className="w-9"></div> {/* 균형을 위한 빈 공간 */}
        </div>

        {/* 현재 모드 표시 */}
        <div className="w-full mb-16">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">현재 모드</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isChildMode ? '아이 모드' : '보호자 모드'}
                </p>
                {selectedChild && (
                  <p className="text-sm text-gray-600 mt-1">
                    {isChildMode ? `${selectedChild.name}(으)로 선택됨` : '모든 아이 관리 가능'}
                  </p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isChildMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isChildMode ? '아이' : '보호자'}
              </div>
            </div>
          </div>
        </div>

        {/* 설정 메뉴 */}
        <div className="w-full space-y-4">
          {/* 모드 전환 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">모드 전환</p>
                  <p className="text-sm text-gray-500">
                    {isChildMode ? '보호자 모드로 전환' : selectedChild ? '아이 모드로 전환' : '아이를 선택해주세요'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleModeToggle}
                disabled={!isChildMode && !selectedChild}
                className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm ${
                  !isChildMode && !selectedChild
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isChildMode ? '보호자로' : '아이로'}
              </button>
            </div>
          </div>



          {/* 로그아웃 */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">로그아웃</p>
                  <p className="text-sm text-gray-500">보호자 계정에서 로그아웃</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-12"></div>
        
        {/* 로고 */}
        <div className="flex justify-center mt-12 w-full">
          <div className="flex items-center gap-2">
            <img src="/logo_not_title.svg" alt="HeartForecast" className="w-10 h-10" />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={
      <Container className="bg-white">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
            <p className="text-gray-600">페이지를 불러오는 중...</p>
          </div>
        </div>
      </Container>
    }>
      <SettingsContent />
    </Suspense>
  );
} 
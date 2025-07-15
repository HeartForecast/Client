'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL, setTokens } from '../../utils/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  const notifyAuthStateChange = () => {
    window.dispatchEvent(new Event('authStateChanged'));
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터에서 코드와 에러 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        console.log('=== OAuth Callback Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('Code:', code);
        console.log('State:', state);
        console.log('Error:', error);

        if (error) {
          setStatus('error');
          setMessage('로그인에 실패했습니다.');
          console.error('OAuth error:', error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('인증 코드를 받지 못했습니다.');
          return;
        }

        // 백엔드에 인증 코드 전송 (쿠키 설정을 위해 credentials: 'include' 사용)
        const response = await fetch(`${API_BASE_URL}/api/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 포함
          body: JSON.stringify({
            code,
            state,
            provider: 'kakao'
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Backend API call successful - authentication successful');
          console.log('Response data:', data);
          
          // 로컬스토리지 저장 전 확인
          console.log('=== LocalStorage Save Debug ===');
          console.log('Before saving - localStorage:', localStorage.getItem('isAuthenticated'));
          
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authTimestamp', Date.now().toString());
          
          // 로컬스토리지 저장 후 확인
          console.log('After saving - isAuthenticated:', localStorage.getItem('isAuthenticated'));
          console.log('After saving - authTimestamp:', localStorage.getItem('authTimestamp'));
          console.log('All localStorage keys:', Object.keys(localStorage));
          
          // AuthContext 강제 업데이트
          notifyAuthStateChange();
          
          setStatus('success');
          setMessage('로그인 성공! 홈으로 이동합니다.');
          setTimeout(() => {
            router.push('/home');
          }, 1500);
        } else {
          throw new Error(data.message || '로그인 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffcc00]"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#ffcc00] text-gray-900 rounded-lg hover:bg-[#e6b800] transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 
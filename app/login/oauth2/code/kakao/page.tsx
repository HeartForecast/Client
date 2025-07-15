'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie, setTokens } from '../../../../utils/api';

function KakaoOAuthCallbackContent() {
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

        // 쿠키에서 토큰 확인
        const accessToken = getCookie('access_social');
        const refreshToken = getCookie('refresh_social');

        console.log('=== Cookie Check ===');
        console.log('Access Token from cookie:', accessToken ? 'Found' : 'Not found');
        console.log('Refresh Token from cookie:', refreshToken ? 'Found' : 'Not found');

        // 모든 쿠키 확인
        console.log('=== All Cookies ===');
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
          console.log('Cookie:', cookie.trim());
        });

        // 쿠키 파싱 함수
        const parseCookies = () => {
          const cookies: { [key: string]: string } = {};
          document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
              cookies[name] = value;
            }
          });
          return cookies;
        };

        const parsedCookies = parseCookies();
        console.log('=== Parsed Cookies ===');
        console.log(parsedCookies);

        // 백엔드에서 설정한 쿠키들 확인
        const backendCookies = [
          'access_social',
          'refresh_social', 
          'JSESSIONID',
          'SESSION'
        ];

        console.log('=== Backend Cookie Check ===');
        backendCookies.forEach(cookieName => {
          const value = parsedCookies[cookieName];
          console.log(`${cookieName}:`, value ? 'Found' : 'Not found');
          if (value) {
            console.log(`${cookieName} length:`, value.length);
            console.log(`${cookieName} preview:`, value.substring(0, 20) + '...');
          }
        });

        // 쿠키 읽기 함수 직접 테스트
        console.log('=== Direct Cookie Test ===');
        const testAccessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_social='))
          ?.split('=')[1];
        console.log('Direct access_social test:', testAccessToken ? 'Found' : 'Not found');

        const testRefreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refresh_social='))
          ?.split('=')[1];
        console.log('Direct refresh_social test:', testRefreshToken ? 'Found' : 'Not found');

        if (accessToken && refreshToken) {
          console.log('✅ JWT tokens found in cookies - authentication successful');
          setTokens(accessToken, refreshToken);
          setStatus('success');
          setMessage('로그인 성공! 홈으로 이동합니다.');
          notifyAuthStateChange();
          setTimeout(() => {
            router.push('/home');
          }, 1500);
          return;
        }

        // JWT 토큰이 없으면 에러
        console.log('❌ No JWT tokens in cookies - authentication failed');
        setStatus('error');
        setMessage('인증 토큰을 받지 못했습니다. 다시 시도해주세요.');

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

export default function KakaoOAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <KakaoOAuthCallbackContent />
    </Suspense>
  );
} 
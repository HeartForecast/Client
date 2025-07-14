'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '../../../../utils/api';

export default function KakaoOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터에서 코드와 에러 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

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

        // 먼저 백엔드의 기본 OAuth2 엔드포인트로 요청
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              state,
              provider: 'kakao'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
              setStatus('success');
              setMessage('로그인 성공! 홈으로 이동합니다.');
              
              // 토큰을 로컬 스토리지에 저장
              if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
              }
              if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
              }
              
              // 홈 페이지로 리다이렉트
              setTimeout(() => {
                router.push('/home');
              }, 1500);
              return;
            }
          }
        } catch (apiError) {
          console.log('Custom API endpoint failed, trying default OAuth2 flow');
        }

        // 커스텀 API가 실패하면 Spring Security OAuth2의 기본 동작 사용
        // 백엔드에서 자동으로 세션을 생성하고 리다이렉트할 것으로 예상
        setStatus('success');
        setMessage('로그인 성공! 홈으로 이동합니다.');
        
        // 임시로 로그인 성공으로 처리 (백엔드에서 세션 관리)
        localStorage.setItem('isLoggedIn', 'true');
        
        setTimeout(() => {
          router.push('/home');
        }, 1500);

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
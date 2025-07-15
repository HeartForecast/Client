// API 관련 유틸리티 함수들

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const KAKAO_LOGIN_URL = process.env.NEXT_PUBLIC_KAKAO_LOGIN_URL;
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const handleKakaoLogin = () => {
  window.location.href = KAKAO_LOGIN_URL!;
};

// 쿠키에서 토큰 읽기 함수
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// 토큰 관리 함수들 - HttpOnly 쿠키 사용으로 인증 상태만 확인
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로
  // 로컬스토리지의 인증 상태만 확인
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authTimestamp = localStorage.getItem('authTimestamp');
  
  if (!isAuthenticated || !authTimestamp) {
    return null;
  }
  
  // 인증 상태가 24시간 이내인지 확인
  const authAge = Date.now() - parseInt(authTimestamp);
  const isRecentAuth = authAge < 24 * 60 * 60 * 1000; // 24시간
  
  if (!isRecentAuth) {
    // 만료된 인증 상태 삭제
    clearTokens();
    return null;
  }
  
  // HttpOnly 쿠키는 백엔드에서만 읽을 수 있으므로
  // 인증 상태만 반환 (실제 토큰은 백엔드에서 처리)
  return 'authenticated';
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // HttpOnly 쿠키는 JavaScript에서 읽을 수 없으므로
  // 로컬스토리지의 인증 상태만 확인
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authTimestamp = localStorage.getItem('authTimestamp');
  
  if (!isAuthenticated || !authTimestamp) {
    return null;
  }
  
  // 인증 상태가 24시간 이내인지 확인
  const authAge = Date.now() - parseInt(authTimestamp);
  const isRecentAuth = authAge < 24 * 60 * 60 * 1000; // 24시간
  
  if (!isRecentAuth) {
    // 만료된 인증 상태 삭제
    clearTokens();
    return null;
  }
  
  // HttpOnly 쿠키는 백엔드에서만 읽을 수 있으므로
  // 인증 상태만 반환 (실제 토큰은 백엔드에서 처리)
  return 'authenticated';
};

// 토큰 설정 함수 - HttpOnly 쿠키 사용으로 인증 상태만 저장
export const setTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;
  
  // HttpOnly 쿠키는 백엔드에서 설정하므로
  // 프론트엔드에서는 인증 상태만 저장
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authTimestamp', Date.now().toString());
  
  console.log('Authentication state saved to localStorage');
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  
  // 백엔드 쿠키 삭제 (가능한 경우)
  document.cookie = 'access_social=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_social=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // 로컬스토리지의 인증 상태 삭제
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authTimestamp');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const isAuthInStorage = localStorage.getItem('isAuthenticated') === 'true';
  const authTimestamp = localStorage.getItem('authTimestamp');
  
  if (!isAuthInStorage || !authTimestamp) {
    return false;
  }
  
  // 인증 상태가 24시간 이내인지 확인
  const authAge = Date.now() - parseInt(authTimestamp);
  const isRecentAuth = authAge < 24 * 60 * 60 * 1000; // 24시간
  
  if (!isRecentAuth) {
    // 만료된 인증 상태 삭제
    clearTokens();
    return false;
  }
  
  return true;
};

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 인증이 필요한 API 요청 헬퍼 함수
export const authenticatedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // HttpOnly 쿠키를 사용하므로 인증 상태만 확인
    if (!isAuthenticated()) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // HttpOnly 쿠키 자동 포함
      ...options,
    });

    if (response.status === 401) {
      // 토큰이 만료된 경우
      clearTokens();
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Authenticated API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 일반 API 요청 헬퍼 함수
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}; 
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

// 토큰 관리 함수들 - 백엔드 쿠키 이름 그대로 사용
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 백엔드에서 설정한 쿠키 이름 그대로 사용
  return getCookie('access_social');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 백엔드에서 설정한 쿠키 이름 그대로 사용
  return getCookie('refresh_social');
};

// 토큰 설정 함수 - 백엔드에서 쿠키로 관리하므로 빈 함수
export const setTokens = (accessToken: string, refreshToken?: string) => {
  // 백엔드에서 쿠키로 설정하므로 프론트엔드에서는 설정하지 않음
  console.log('Tokens are managed by backend cookies');
};

export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  
  // 백엔드 쿠키 이름 그대로 사용하여 삭제
  document.cookie = 'access_social=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_social=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
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
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함
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
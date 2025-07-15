// API 관련 유틸리티 함수들
import { 
  ChildCreateRequest, 
  ChildCreateResponse 
} from '../types/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const KAKAO_LOGIN_URL = process.env.NEXT_PUBLIC_KAKAO_LOGIN_URL;
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const handleKakaoLogin = () => {
  window.location.href = KAKAO_LOGIN_URL!;
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

    // 응답 텍스트를 먼저 확인
    const responseText = await response.text();
    
    // 빈 응답인 경우 성공으로 처리
    if (!responseText) {
      return { success: true, data: undefined };
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response text:', responseText);
      // 파싱 실패해도 성공으로 처리 (빈 응답이 정상인 경우)
      return { success: true, data: undefined };
    }
    
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

// 서버에서 인증 상태 확인 함수
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    console.log('Checking auth status at:', `${API_BASE_URL}/api/check`);
    
    const response = await fetch(`${API_BASE_URL}/api/check`, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('Token expired or invalid - clearing local auth state');
      // 토큰이 만료되었거나 유효하지 않은 경우 로컬 상태 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authTimestamp');
        clearTokens();
      }
      return false;
    }
    
    if (!response.ok) {
      console.log('Response not ok, status:', response.status);
      return false;
    }

    // 응답 텍스트를 먼저 확인
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!responseText) {
      console.log('Empty response text');
      return false;
    }

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw response text:', responseText);
      return false;
    }

    console.log('Parsed response data:', data);
    
    // 성공적인 응답인 경우 로컬 상태 업데이트
    if (data.success === true && typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
    }
    
    return data.success === true;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
}; 

// 아이 생성 API 함수
export const createChild = async (childData: ChildCreateRequest): Promise<ApiResponse<ChildCreateResponse>> => {
  try {
    const response = await authenticatedApiRequest<ChildCreateResponse>('/api/children/child', {
      method: 'POST',
      body: JSON.stringify(childData),
    });

    if (response.success) {
      console.log('아이 생성 성공:', response.data);
    } else {
      console.error('아이 생성 실패:', response.error);
    }

    return response;
  } catch (error) {
    console.error('아이 생성 API 호출 중 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '아이 생성 중 오류가 발생했습니다.',
    };
  }
}; 
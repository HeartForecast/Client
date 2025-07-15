// 카카오 인증 관련 유틸리티 함수들
import { ChildCreateRequest, ChildCreateResponse } from '../types/api';

// 환경변수: API 주소만 사용
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://heartforecast.co.kr';

// 카카오 로그인 URL 생성
export const getKakaoLoginUrl = () => `${API_BASE_URL}/oauth2/authorization/kakao`;

// 카카오 로그인 시작
export const handleKakaoLogin = () => {
  window.location.href = getKakaoLoginUrl();
};

// 인증 상태 체크 (24시간 유효)
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const ts = localStorage.getItem('authTimestamp');
  if (!isAuth || !ts) return false;
  const age = Date.now() - parseInt(ts);
  if (age > 24 * 60 * 60 * 1000) {
    clearAuthState();
    return false;
  }
  return true;
};

// 인증 상태 저장 (로그인 성공 시)
export const setAuthState = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authTimestamp', Date.now().toString());
};

// 인증 상태 삭제 (로그아웃/만료 시)
export const clearAuthState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authTimestamp');
};

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 인증이 필요한 API 요청
export const authenticatedApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    if (!isAuthenticated()) throw new Error('인증 토큰이 없습니다.');
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    });
    if (response.status === 401) {
      clearAuthState();
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 일반 API 요청
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 서버에서 인증 상태 확인
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 401) {
      clearAuthState();
      return false;
    }
    if (!response.ok) return false;
    const text = await response.text();
    if (!text) return false;
    let data;
    try { data = JSON.parse(text); } catch { return false; }
    return data.authenticated === true || data.success === true;
  } catch {
    return false;
  }
};

// 자식 생성 API
export const createChild = async (childData: ChildCreateRequest): Promise<ApiResponse<ChildCreateResponse>> => {
  return authenticatedApiRequest<ChildCreateResponse>('/api/children', {
    method: 'POST',
    body: JSON.stringify(childData),
  });
}; 
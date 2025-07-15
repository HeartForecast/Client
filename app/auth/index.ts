import { ChildCreateRequest, ChildCreateResponse } from '../types/api';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getKakaoLoginUrl = () => `${API_BASE_URL}/oauth2/authorization/kakao`;

export const handleKakaoLogin = () => {
  window.location.href = getKakaoLoginUrl();
};

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

export const setAuthState = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authTimestamp', Date.now().toString());
};

export const clearAuthState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authTimestamp');
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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

export const createChild = async (childData: ChildCreateRequest): Promise<ApiResponse<ChildCreateResponse>> => {
  return authenticatedApiRequest<ChildCreateResponse>('/api/children', {
    method: 'POST',
    body: JSON.stringify(childData),
  });
};

// 통계 API 타입 정의
export interface DailyTemperatureData {
  date: string;
  avgTemp: number;
}

export interface AverageTemperatureData {
  avgTemp: number;
}

export interface TimezoneEmotionData {
  timeZone: string;
  emotions: Array<{
    emotionName: string;
    count: number;
  }>;
}

export interface EmotionRatioData {
  emotionName: string;
  count: number;
  ratio: number;
}

export interface EmotionErrorRateData {
  emotionName: string;
  count: number;
  errorRate: number;
}

// 통계 API 함수들
export const getDailyTemperature = async (
  childId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<DailyTemperatureData[]>> => {
  const params = new URLSearchParams({ startDate, endDate });
  return authenticatedApiRequest<DailyTemperatureData[]>(`/api/statistics/${childId}/temperature/daily?${params}`);
};

export const getAverageTemperature = async (
  childId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<AverageTemperatureData>> => {
  const params = new URLSearchParams({ startDate, endDate });
  return authenticatedApiRequest<AverageTemperatureData>(`/api/statistics/${childId}/temperature/average?${params}`);
};

export const getTimezoneEmotions = async (
  childId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<TimezoneEmotionData[]>> => {
  const params = new URLSearchParams({ startDate, endDate });
  return authenticatedApiRequest<TimezoneEmotionData[]>(`/api/statistics/${childId}/emotions/timezones?${params}`);
};

export const getEmotionRatio = async (
  childId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<EmotionRatioData[]>> => {
  const params = new URLSearchParams({ startDate, endDate });
  return authenticatedApiRequest<EmotionRatioData[]>(`/api/statistics/${childId}/emotions/ratio?${params}`);
};

export const getEmotionErrorRate = async (
  childId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<EmotionErrorRateData[]>> => {
  const params = new URLSearchParams({ startDate, endDate });
  return authenticatedApiRequest<EmotionErrorRateData[]>(`/api/statistics/${childId}/emotions/error-rate?${params}`);
}; 
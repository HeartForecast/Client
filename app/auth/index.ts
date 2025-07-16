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
  console.log('🔍 localStorage 확인:', { 
    isAuthenticated: localStorage.getItem('isAuthenticated'), 
    authTimestamp: ts,
    isAuthBoolean: isAuth
  });
  if (!isAuth || !ts) return false;
  const age = Date.now() - parseInt(ts);
  console.log('⏰ 토큰 만료 확인:', { age, maxAge: 24 * 60 * 60 * 1000, isExpired: age > 24 * 60 * 60 * 1000 });
  if (age > 24 * 60 * 60 * 1000) {
    console.log('⏰ 토큰 만료 - localStorage 정리');
    clearAuthState();
    return false;
  }
  return true;
};

// 비동기 인증 상태 확인 (쿠키 기반)
export const isAuthenticatedAsync = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    console.log('🚫 서버사이드 환경 - 인증 실패');
    return false;
  }
  
  // 먼저 localStorage 확인
  const localAuthValid = isAuthenticated();
  console.log('🔍 localStorage 인증 상태:', localAuthValid);
  if (localAuthValid) {
    console.log('✅ localStorage 인증 성공');
    return true;
  }
  
  // localStorage가 없거나 만료된 경우 서버에서 확인
  console.log('📡 서버에서 쿠키 기반 인증 상태 확인 중...');
  try {
    const serverAuthStatus = await checkAuthStatus();
    console.log('🔍 서버 인증 응답:', serverAuthStatus);
    if (serverAuthStatus) {
      // 서버에서 인증되었다면 localStorage 동기화
      console.log('✅ 서버 인증 성공 - localStorage 동기화 중');
      setAuthState();
      console.log('🔄 localStorage 동기화 완료:', {
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        authTimestamp: localStorage.getItem('authTimestamp')
      });
      return true;
    }
    console.log('❌ 서버 인증 실패');
    return false;
  } catch (error) {
    console.log('❌ 서버 인증 확인 중 오류:', error);
    return false;
  }
};

export const setAuthState = () => {
  if (typeof window === 'undefined') {
    console.log('🚫 setAuthState: 서버사이드 환경');
    return;
  }
  console.log('💾 setAuthState: localStorage에 인증 정보 저장 중...');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('authTimestamp', Date.now().toString());
  console.log('✅ setAuthState 완료:', {
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    authTimestamp: localStorage.getItem('authTimestamp')
  });
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
    console.log('🔐 authenticatedApiRequest 시작:', { endpoint, options });
    
    // 비동기 인증 상태 확인 (localStorage + 서버 쿠키 확인)
    const isAuth = await isAuthenticatedAsync();
    if (!isAuth) {
      console.log('❌ 인증 실패 - 토큰이 없습니다');
      throw new Error('인증 토큰이 없습니다.');
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 API 요청:', { url, method: options.method || 'GET' });
    
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    });
    
    console.log('📡 API 응답:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });
    
    if (response.status === 401) {
      console.log('❌ 401 Unauthorized - 인증 만료');
      clearAuthState();
      window.location.href = '/';
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API 오류 응답:', { status: response.status, errorText });
      throw new Error(`API 오류! 상태: ${response.status}, 내용: ${errorText}`);
    }
    
    // 응답 본문 확인
    const responseText = await response.text();
    console.log('📄 응답 본문 텍스트:', responseText);
    
    let data;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('✅ JSON 파싱 성공:', data);
      } catch (parseError) {
        console.log('⚠️ JSON 파싱 실패, 텍스트로 처리:', responseText);
        data = { message: responseText };
      }
    } else {
      console.log('✅ 응답 본문이 비어있음 - 성공으로 처리');
      data = { success: true };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ authenticatedApiRequest 오류:', error);
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
    console.log('📡 checkAuthStatus 호출 - API_BASE_URL:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/check`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('📡 서버 응답 상태:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('❌ 401 Unauthorized - localStorage 정리');
      clearAuthState();
      return false;
    }
    if (!response.ok) {
      console.log('❌ 응답이 ok가 아님:', response.status);
      return false;
    }
    const text = await response.text();
    console.log('📡 서버 응답 본문:', text);
    if (!text) {
      console.log('❌ 응답 본문이 비어있음');
      return false;
    }
    let data;
    try { 
      data = JSON.parse(text); 
      console.log('📡 파싱된 응답 데이터:', data);
    } catch { 
      console.log('❌ JSON 파싱 실패');
      return false; 
    }
    const isAuthenticated = data.authenticated === true || data.success === true;
    console.log('🔍 최종 인증 결과:', isAuthenticated);
    return isAuthenticated;
  } catch (error) {
    console.log('❌ checkAuthStatus 오류:', error);
    return false;
  }
};

export const createChild = async (childData: ChildCreateRequest): Promise<ApiResponse<ChildCreateResponse>> => {
  console.log('👶 createChild 호출 시작:', childData);
  try {
    const result = await authenticatedApiRequest<ChildCreateResponse>('/api/children/child', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
    console.log('👶 createChild 결과:', result);
    return result;
  } catch (error) {
    console.error('👶 createChild 오류:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// 아이 관계 API 타입 정의
export interface ChildRelationData {
  id: number;
  username: string;
  birthdate: string;
  createdAt: string;
}

// 아이 관계 API 함수
export const getChildRelations = async (): Promise<ApiResponse<ChildRelationData[]>> => {
  return authenticatedApiRequest<ChildRelationData[]>('/api/childRelations');
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
  type: string;
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

// 예보 및 예보 기록 API 타입 정의
export interface ForecastData {
  id: number;
  childId: number;
  emotionTypeId: number;
  date: string;
  timeZone: string;
  memo: string;
}

export interface ForecastRecordData {
  id: number;
  forecastId: number;
  childId: number;
  emotionTypeId: number;
  date: string;
  timeZone: string;
  memo: string;
}

// 예보 및 예보 기록 API 함수들
export const getAllForecasts = async (childId: number): Promise<ApiResponse<ForecastData[]>> => {
  return authenticatedApiRequest<ForecastData[]>(`/api/forecasts/${childId}`);
};

export const getForecastsByDate = async (childId: number, date: string): Promise<ApiResponse<ForecastData[]>> => {
  return authenticatedApiRequest<ForecastData[]>(`/api/forecasts/${childId}/${date}`);
};

export const getForecastById = async (forecastId: number): Promise<ApiResponse<ForecastData>> => {
  return authenticatedApiRequest<ForecastData>(`/api/forecasts/forecast/${forecastId}`);
};

export const checkForecastExists = async (childId: number, forecastId: number): Promise<ApiResponse<boolean>> => {
  return authenticatedApiRequest<boolean>(`/api/forecasts/${childId}/${forecastId}/exists`);
};

export const getAllForecastRecords = async (childId: number): Promise<ApiResponse<ForecastRecordData[]>> => {
  return authenticatedApiRequest<ForecastRecordData[]>(`/api/forecastRecords/${childId}`);
};

export const getForecastRecordsByDate = async (childId: number, date: string): Promise<ApiResponse<ForecastRecordData[]>> => {
  return authenticatedApiRequest<ForecastRecordData[]>(`/api/forecastRecords/${childId}/${date}`);
};

export const getForecastRecordById = async (forecastRecordId: number): Promise<ApiResponse<ForecastRecordData>> => {
  return authenticatedApiRequest<ForecastRecordData>(`/api/forecastRecords/forecastRecord/${forecastRecordId}`);
}; 
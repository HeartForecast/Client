// API 관련 타입 정의

// 공통 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 아이 관련 타입
export interface ChildCreateRequest {
  username: string;
  birthdate: string; // YYYY-MM-DD 형식
  gender: string; // "남성" 또는 "여성"
  healthInfo?: string;
}

export interface ChildCreateResponse {
  id?: number;
  username: string;
  birthdate: string;
  gender: string;
  healthInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Child {
  id: number;
  username: string;
  birthdate: string;
  gender: string;
  healthInfo?: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 관련 타입
export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// 인증 관련 타입
export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
} 
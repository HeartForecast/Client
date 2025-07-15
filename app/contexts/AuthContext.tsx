'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, getAccessToken, clearTokens } from '../utils/api';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    console.log('=== AuthContext checkAuth ===');
    console.log('Document available:', typeof document !== 'undefined');
    
    // isAuthenticated 함수 사용 (로컬스토리지 기반)
    const newLoginState = isAuthenticated();
    
    // 디버깅을 위한 추가 로그
    console.log('isAuthenticated() result:', newLoginState);
    console.log('localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('localStorage authTimestamp:', localStorage.getItem('authTimestamp'));
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    console.log('Setting isLoggedIn to:', newLoginState);
    
    setIsLoggedIn(newLoginState);
    setLoading(false);
  };

  const logout = () => {
    clearTokens();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('=== Storage change detected ===');
      checkAuth();
    };

    // storage 이벤트 리스너 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);
    
    // 현재 탭에서의 변경 감지를 위한 커스텀 이벤트
    window.addEventListener('authStateChanged', handleStorageChange);
    
    // 주기적으로 인증 상태 확인 (개발용)
    const interval = setInterval(() => {
      const currentAuth = isAuthenticated();
      if (currentAuth !== isLoggedIn) {
        console.log('Auth state changed from', isLoggedIn, 'to', currentAuth);
        checkAuth();
      }
    }, 1000); // 1초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleStorageChange);
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  const value: AuthContextType = {
    isLoggedIn,
    loading,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
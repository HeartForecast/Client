'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, getAccessToken, clearTokens, checkAuthStatus } from '../utils/api';

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

  const checkAuth = async () => {
    try {
      // 서버에서 인증 상태 확인
      const serverAuthStatus = await checkAuthStatus();
      console.log('Server auth status:', serverAuthStatus);
      
      // 로컬 토큰도 확인 (백업용)
      const token = getAccessToken();
      const localAuthStatus = !!token;
      
      console.log('Local token status:', localAuthStatus);
      
      // 서버 인증 상태를 우선으로 사용
      setIsLoggedIn(serverAuthStatus);
      setLoading(false);
      
      console.log('Final auth state:', serverAuthStatus);
      
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트 (홈 페이지가 아닌 경우)
      if (!serverAuthStatus && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/auth/callback') {
          console.log('Redirecting to login page due to authentication failure');
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // 에러 발생 시 로컬 토큰으로 폴백
      const token = getAccessToken();
      setIsLoggedIn(!!token);
      setLoading(false);
    }
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
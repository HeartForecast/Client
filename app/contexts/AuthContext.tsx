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
    
    // 백엔드 API를 호출해서 인증 상태 확인
    const verifyAuth = async () => {
      try {
        console.log('Checking auth with backend...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check`, {
          method: 'GET',
          credentials: 'include', // HttpOnly 쿠키 포함
        });
        
        console.log('Backend auth check response:', response.status, response.ok);
        
        if (response.ok) {
          // 백엔드에서 인증 성공
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authTimestamp', Date.now().toString());
          console.log('✅ Backend auth successful - setting localStorage');
        } else {
          // 백엔드에서 인증 실패
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authTimestamp');
          console.log('❌ Backend auth failed - clearing localStorage');
        }
        
        const newLoginState = response.ok;
        console.log('Setting isLoggedIn to:', newLoginState);
        
        setIsLoggedIn(newLoginState);
        setLoading(false);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authTimestamp');
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    
    verifyAuth();
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
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated, setAuthState, clearAuthState, checkAuthStatus } from './index';

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
      setIsLoggedIn(serverAuthStatus);
      setLoading(false);
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트 (홈/콜백 제외)
      if (!serverAuthStatus && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/' && currentPath !== '/auth/callback') {
          window.location.href = '/';
        }
      }
    } catch {
      setIsLoggedIn(isAuthenticated());
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthState();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleStorageChange);
    const interval = setInterval(() => {
      if (isAuthenticated() !== isLoggedIn) {
        checkAuth();
      }
    }, 1000);
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
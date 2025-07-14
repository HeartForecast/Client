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
    // JWT 토큰 확인
    const token = getAccessToken();
    
    // 세션 기반 로그인 확인 (임시)
    const sessionLogin = localStorage.getItem('isLoggedIn') === 'true';
    
    setIsLoggedIn(!!token || sessionLogin);
    setLoading(false);
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

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
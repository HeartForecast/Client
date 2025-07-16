'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChildData {
  id: number;
  name: string;
  age: number;
  registeredDate: string;
}

interface ChildContextType {
  selectedChild: ChildData | null;
  isChildMode: boolean;
  isLoading: boolean;
  setSelectedChild: (child: ChildData | null) => void;
  enterChildMode: (child: ChildData) => void;
  exitChildMode: () => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [isChildMode, setIsChildMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage에서 상태 복원
  useEffect(() => {
    // 서버 사이드 렌더링 중에는 localStorage 접근하지 않음
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    const savedChild = localStorage.getItem('selectedChild');
    const savedMode = localStorage.getItem('isChildMode');
    
    if (savedChild && savedMode === 'true') {
      try {
        const parsedChild = JSON.parse(savedChild);
        setSelectedChild(parsedChild);
        setIsChildMode(true);
      } catch (error) {
        console.error('Error parsing saved child:', error);
      }
    } else if (savedChild) {
      try {
        const parsedChild = JSON.parse(savedChild);
        setSelectedChild(parsedChild);
      } catch (error) {
        console.error('Error parsing saved child:', error);
      }
    }
    
    setIsLoading(false);

    // 안전장치: 3초 후에도 로딩이 끝나지 않으면 강제로 로딩 종료
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const enterChildMode = (child: ChildData) => {
    setSelectedChild(child);
    setIsChildMode(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedChild', JSON.stringify(child));
      localStorage.setItem('isChildMode', 'true');
    }
  };

  const exitChildMode = () => {
    setSelectedChild(null);
    setIsChildMode(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedChild');
      localStorage.removeItem('isChildMode');
    }
  };

  return (
    <ChildContext.Provider value={{
      selectedChild,
      isChildMode,
      isLoading,
      setSelectedChild,
      enterChildMode,
      exitChildMode
    }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
} 
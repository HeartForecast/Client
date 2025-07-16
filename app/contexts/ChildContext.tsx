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
  hasChildren: boolean;
  setSelectedChild: (child: ChildData | null) => void;
  enterChildMode: (child: ChildData) => void;
  exitChildMode: () => void;
  autoSelectFirstChild: () => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [isChildMode, setIsChildMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChildren, setHasChildren] = useState(false);

  // localStorage에서 상태 복원 및 초기 hasChildren 확인
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
    
    // 초기 hasChildren 상태 확인
    const checkHasChildren = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiBaseUrl}/api/childRelations`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHasChildren(data && data.length > 0);
        }
      } catch (error) {
        console.error('hasChildren 확인 실패:', error);
        setHasChildren(false);
      }
    };

    checkHasChildren();
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

  const autoSelectFirstChild = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/childRelations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        setHasChildren(true);
        const firstChild = data[0];
        const birthYear = new Date(firstChild.birthdate).getFullYear();
        const thisYear = new Date().getFullYear();
        const age = thisYear - birthYear;

        const childData: ChildData = {
          id: firstChild.id,
          name: firstChild.username,
          age,
          registeredDate: new Date(firstChild.createdAt).toLocaleDateString('ko-KR')
        };

        setSelectedChild(childData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedChild', JSON.stringify(childData));
        }
      } else {
        setHasChildren(false);
        // 아이가 없으면 아이 목록 페이지로 이동
        if (typeof window !== 'undefined') {
          window.location.href = '/settings';
        }
      }
    } catch (error) {
      console.error('자동 아이 선택 실패:', error);
      setHasChildren(false);
    }
  };

  return (
    <ChildContext.Provider value={{
      selectedChild,
      isChildMode,
      isLoading,
      hasChildren,
      setSelectedChild,
      enterChildMode,
      exitChildMode,
      autoSelectFirstChild
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
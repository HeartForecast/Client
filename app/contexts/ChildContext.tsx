'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChildData {
  id: number;
  name: string;
  age: number;
  registeredDate: string;
  inviteCode: string;
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
  const [justExitedChildMode, setJustExitedChildMode] = useState(false);

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
        // 파싱 실패 시 localStorage 정리
        localStorage.removeItem('selectedChild');
        localStorage.removeItem('isChildMode');
      }
    } else if (savedChild) {
      try {
        const parsedChild = JSON.parse(savedChild);
        setSelectedChild(parsedChild);
      } catch (error) {
        console.error('Error parsing saved child:', error);
        // 파싱 실패 시 localStorage 정리
        localStorage.removeItem('selectedChild');
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
          
          // 저장된 아이가 실제로 존재하는지 확인하고 inviteCode 업데이트
          if (savedChild && data && data.length > 0) {
            try {
              const parsedChild = JSON.parse(savedChild);
              const childExists = data.some((child: any) => child.id === parsedChild.id);
              if (!childExists) {
                // 저장된 아이가 더 이상 존재하지 않으면 localStorage 정리
                localStorage.removeItem('selectedChild');
                setSelectedChild(null);
              } else {
                // 아이가 존재하면 inviteCode를 포함한 최신 데이터로 업데이트
                const updatedChild = data.find((child: any) => child.id === parsedChild.id);
                if (updatedChild && !parsedChild.inviteCode) {
                  const birthYear = new Date(updatedChild.birthdate).getFullYear();
                  const thisYear = new Date().getFullYear();
                  const age = thisYear - birthYear;

                  const updatedChildData: ChildData = {
                    id: updatedChild.id,
                    name: updatedChild.username,
                    age,
                    registeredDate: new Date(updatedChild.createdAt).toLocaleDateString('ko-KR'),
                    inviteCode: updatedChild.inviteCode || '',
                  };

                  setSelectedChild(updatedChildData);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('selectedChild', JSON.stringify(updatedChildData));
                  }
                }
              }
            } catch (error) {
              console.error('Error checking saved child existence:', error);
            }
          }
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
    // 보호자 모드로 돌아올 때는 선택된 아이를 유지
    setIsChildMode(false);
    setJustExitedChildMode(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isChildMode');
      // selectedChild는 유지 (localStorage에서 제거하지 않음)
    }
    
    // 3초 후에 플래그 해제
    setTimeout(() => {
      setJustExitedChildMode(false);
    }, 3000);
  };

  const autoSelectFirstChild = async () => {
    // 이미 선택된 아이가 있거나 아이 모드에서 보호자 모드로 돌아온 직후라면 자동 선택하지 않음
    if (selectedChild || isChildMode || justExitedChildMode) {
      return;
    }

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
          registeredDate: new Date(firstChild.createdAt).toLocaleDateString('ko-KR'),
          inviteCode: firstChild.inviteCode || '',
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
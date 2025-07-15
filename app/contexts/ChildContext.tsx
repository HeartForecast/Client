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
    console.log('=== ChildContext useEffect running ===');
    
    const savedChild = localStorage.getItem('selectedChild');
    const savedMode = localStorage.getItem('isChildMode');
    
    console.log('Saved child:', savedChild);
    console.log('Saved mode:', savedMode);
    
    if (savedChild && savedMode === 'true') {
      console.log('Restoring child mode with saved child');
      try {
        const parsedChild = JSON.parse(savedChild);
        console.log('Parsed child:', parsedChild);
        setSelectedChild(parsedChild);
        setIsChildMode(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing saved child:', error);
        setIsLoading(false);
      }
    } else if (savedChild) {
      console.log('Restoring saved child');
      try {
        const parsedChild = JSON.parse(savedChild);
        console.log('Parsed child:', parsedChild);
        setSelectedChild(parsedChild);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing saved child:', error);
        setIsLoading(false);
      }
    } else {
      console.log('No saved child, setting loading to false');
      setIsLoading(false);
    }

    // 안전장치: 3초 후에도 로딩이 끝나지 않으면 강제로 로딩 종료
    const timeout = setTimeout(() => {
      console.log('Loading timeout, forcing loading to false');
      setIsLoading(false);
    }, 3000);

    return () => {
      console.log('Clearing timeout');
      clearTimeout(timeout);
    };
  }, []);

  const enterChildMode = (child: ChildData) => {
    console.log('Entering child mode with:', child);
    setSelectedChild(child);
    setIsChildMode(true);
    localStorage.setItem('selectedChild', JSON.stringify(child));
    localStorage.setItem('isChildMode', 'true');
  };

  const exitChildMode = () => {
    console.log('Exiting child mode');
    setSelectedChild(null);
    setIsChildMode(false);
    localStorage.removeItem('selectedChild');
    localStorage.removeItem('isChildMode');
  };

  console.log('ChildContext render - isLoading:', isLoading, 'selectedChild:', selectedChild, 'isChildMode:', isChildMode);

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
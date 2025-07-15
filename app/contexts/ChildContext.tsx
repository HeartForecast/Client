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
  setSelectedChild: (child: ChildData | null) => void;
  enterChildMode: (child: ChildData) => void;
  exitChildMode: () => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);
  const [isChildMode, setIsChildMode] = useState(false);

  // localStorage에서 상태 복원
  useEffect(() => {
    const savedChild = localStorage.getItem('selectedChild');
    const savedMode = localStorage.getItem('isChildMode');
    
    if (savedChild && savedMode === 'true') {
      setSelectedChild(JSON.parse(savedChild));
      setIsChildMode(true);
    }
  }, []);

  const enterChildMode = (child: ChildData) => {
    setSelectedChild(child);
    setIsChildMode(true);
    localStorage.setItem('selectedChild', JSON.stringify(child));
    localStorage.setItem('isChildMode', 'true');
  };

  const exitChildMode = () => {
    setSelectedChild(null);
    setIsChildMode(false);
    localStorage.removeItem('selectedChild');
    localStorage.removeItem('isChildMode');
  };

  return (
    <ChildContext.Provider value={{
      selectedChild,
      isChildMode,
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
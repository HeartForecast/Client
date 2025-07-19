'use client'

import React from 'react';
import HeaderBar from './HeaderBar';
import { useChild } from '../contexts/ChildContext';

interface PageHeaderProps {
  customTitle?: string;
  showChildListButton?: boolean;
  showLogo?: boolean;
}

export default function PageHeader({ 
  customTitle, 
  showChildListButton = false,
  showLogo = false
}: PageHeaderProps) {
  const { selectedChild } = useChild();

  return (
    <div className="flex flex-col w-full rounded-lg mb-6">
      {/* 로고 영역 */}
      {showLogo && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <img src="/logo_not_title.svg" alt="HeartForecast" className="w-10 h-10" />
          </div>
        </div>
      )}
      
      {/* 헤더바 */}
      <HeaderBar 
        childName={customTitle || selectedChild?.name || ''}
        inviteCode={selectedChild?.inviteCode}
        showChildListButton={showChildListButton}
        showSettingsButton={true}
      />
    </div>
  );
} 
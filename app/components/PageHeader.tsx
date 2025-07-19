'use client'

import React from 'react';
import HeaderBar from './HeaderBar';
import { useChild } from '../contexts/ChildContext';

interface PageHeaderProps {
  customTitle?: string;
  showChildListButton?: boolean;
}

export default function PageHeader({ 
  customTitle, 
  showChildListButton = false 
}: PageHeaderProps) {
  const { selectedChild } = useChild();

  return (
    <div className="flex items-center justify-between w-full rounded-lg mb-6">
      <HeaderBar 
        childName={customTitle || selectedChild?.name || ''}
        inviteCode={selectedChild?.inviteCode}
        showChildListButton={showChildListButton}
        showSettingsButton={true}
      />
    </div>
  );
} 